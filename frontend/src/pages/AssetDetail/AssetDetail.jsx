import { useParams } from "react-router-dom";
import { useApiData } from "../../hooks/useApiData";
import { getAssetById } from "../../services/marketService";
import { LoadingState, ErrorState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";
import { getAssetAccent } from "../../utils/assetTheme";
import AnimatedNumber from "../../components/common/AnimatedNumber";
import TradeForm from "../../components/trading/TradeForm";
import PriceChart from "../../components/market/PriceChart";

export default function AssetDetail() {
  const { assetId } = useParams();
  const { data: asset, loading, error, refetch } = useApiData(
    () => getAssetById(assetId),
    [assetId]
  );

  return (
    <div className="asset-detail-page">
      {loading && <LoadingState message="Loading asset..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {asset && (
        <>
          <span className="asset-chip">
            <span className="dot" style={{ background: getAssetAccent(asset.symbol) }} />
            {asset.name} ({asset.symbol})
          </span>
          <p className="asset-price">
            <AnimatedNumber value={asset.priceInr} format={formatInr} />
            <span className={asset.change24h >= 0 ? "positive" : "negative"}>
              {formatPercent(asset.change24h)} (24h)
            </span>
          </p>

          <PriceChart assetId={asset.assetId} accentColor={getAssetAccent(asset.symbol)} />

          <TradeForm asset={asset} onTradeComplete={refetch} />
        </>
      )}
    </div>
  );
}
