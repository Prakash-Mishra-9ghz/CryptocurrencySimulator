import { Link } from "react-router-dom";
import { useApiData } from "../../hooks/useApiData";
import { getAssets } from "../../services/marketService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";

export default function Market() {
  const { data: assets, loading, error, refetch } = useApiData(getAssets, []);

  return (
    <div className="market-page">
      <h1>Market</h1>

      {loading && <LoadingState message="Loading market prices..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {assets && assets.length === 0 && <EmptyState message="No supported assets found." />}

      {assets && assets.length > 0 && (
        <table className="asset-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Price (INR)</th>
              <th>24h Change</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.assetId}>
                <td>
                  {asset.name} ({asset.symbol})
                </td>
                <td>{formatInr(asset.priceInr)}</td>
                <td className={asset.change24h >= 0 ? "positive" : "negative"}>
                  {formatPercent(asset.change24h)}
                </td>
                <td>
                  <Link to={`/market/${asset.assetId}`}>Trade</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
