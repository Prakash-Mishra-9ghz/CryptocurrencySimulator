/**
 * Each of the 6 supported assets gets its own recognizable accent color,
 * used consistently as a left-border stripe wherever the asset appears
 * (ticker rows, portfolio table, trade page). Grounded in each coin's
 * actual brand color, not arbitrary.
 */
export const ASSET_ACCENTS = {
  BTC: "#F7931A",
  ETH: "#8A92B2",
  BNB: "#F3BA2F",
  SOL: "#14F1B2",
  XRP: "#3A9BFF",
  DOGE: "#D4AF37",
};

export function getAssetAccent(symbol) {
  return ASSET_ACCENTS[symbol] || "#7C5CFF";
}
