import { useParams } from "react-router-dom";
import { useApiData } from "../../hooks/useApiData";
import { getAssetById } from "../../services/marketService";
import { LoadingState, ErrorState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";
import TradeForm from "../../components/trading/TradeForm";

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
          <h1>
            {asset.name} ({asset.symbol})
          </h1>
          <p className="asset-price">
            {formatInr(asset.priceInr)}{" "}
            <span className={asset.change24h >= 0 ? "positive" : "negative"}>
              {formatPercent(asset.change24h)} (24h)
            </span>
          </p>

          <TradeForm asset={asset} onTradeComplete={refetch} />
        </>
      )}
    </div>
  );
}
