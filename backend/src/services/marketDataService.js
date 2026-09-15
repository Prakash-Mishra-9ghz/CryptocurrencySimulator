const { SUPPORTED_ASSETS, getSupportedAssetIds, findSupportedAsset } = require("../config/supportedAssets");

const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = (Number(process.env.MARKET_CACHE_TTL_SECONDS) || 30) * 1000;

// In-memory cache. Fine for a single-process academic project (spec
// explicitly avoids Redis/distributed infra — Section "avoid unnecessary
// dependencies"). Resets on server restart, which is acceptable here.
let cache = { data: null, fetchedAt: 0 };

function isCacheFresh() {
  return cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

async function fetchFromCoinGecko() {
  const ids = getSupportedAssetIds().join(",");
  const url = `${process.env.COINGECKO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=inr&include_24hr_change=true`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Market data request timed out.");
    }
    throw new Error("Unable to reach market data provider.");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new Error("Market data provider rate limit exceeded. Please try again shortly.");
  }
  if (!response.ok) {
    throw new Error(`Market data provider returned an error (status ${response.status}).`);
  }

  const raw = await response.json();

  // Normalize into our internal shape, and validate every expected asset
  // actually came back — CoinGecko can silently omit an id it doesn't
  // recognize, which must not crash the app or return partial garbage.
  const normalized = SUPPORTED_ASSETS.map((asset) => {
    const entry = raw[asset.assetId];
    if (!entry || typeof entry.inr !== "number") {
      throw new Error(`Market data provider returned incomplete data for ${asset.symbol}.`);
    }
    return {
      assetId: asset.assetId,
      symbol: asset.symbol,
      name: asset.name,
      priceInr: entry.inr,
      change24h: typeof entry.inr_24h_change === "number" ? entry.inr_24h_change : 0,
    };
  });

  return normalized;
}

/**
 * Used by dashboard/market list reads. Serves from a 30s in-memory
 * cache to stay well within CoinGecko's free-tier rate limits
 * (architecture decision #8).
 */
async function getCachedAssetPrices() {
  if (isCacheFresh()) {
    return cache.data;
  }
  const data = await fetchFromCoinGecko();
  cache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Used ONLY by trade execution (Phase 4). Always bypasses the cache —
 * BUY/SELL must use a freshly fetched price, never the dashboard's
 * cached price (architecture decision #6).
 */
async function getFreshAssetPrice(assetId) {
  const asset = findSupportedAsset(assetId);
  if (!asset) {
    throw new Error("Unsupported asset.");
  }
  const allPrices = await fetchFromCoinGecko();
  const match = allPrices.find((a) => a.assetId === assetId);
  if (!match) {
    throw new Error("Unable to fetch a fresh price for this asset.");
  }
  return match;
}

module.exports = { getCachedAssetPrices, getFreshAssetPrice };
