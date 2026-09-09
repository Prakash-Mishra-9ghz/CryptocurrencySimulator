import { useApiData } from "../../hooks/useApiData";
import { getPortfolio } from "../../services/portfolioService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";

export default function Portfolio() {
  const { data, loading, error, refetch } = useApiData(getPortfolio, []);

  return (
    <div className="portfolio-page">
      <h1>Portfolio</h1>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          <div className="summary-cards">
            <div className="card">
              <span>Total Value</span>
              <strong>{formatInr(data.totalValue)}</strong>
            </div>
            <div className="card">
              <span>Available Cash</span>
              <strong>{formatInr(data.availableCash)}</strong>
            </div>
            <div className="card">
              <span>Unrealized P&amp;L</span>
              <strong>
                {formatInr(data.totalPnl)} ({formatPercent(data.totalPnlPercent)})
              </strong>
            </div>
          </div>

          {(!data.holdings || data.holdings.length === 0) && (
            <EmptyState message="No holdings yet. Buy an asset from the Market page to get started." />
          )}

          {data.holdings && data.holdings.length > 0 && (
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Quantity</th>
                  <th>Avg. Cost</th>
                  <th>Current Price</th>
                  <th>Market Value</th>
                  <th>Unrealized P&amp;L</th>
                  <th>Allocation</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((h) => (
                  <tr key={h.assetId}>
                    <td>{h.symbol}</td>
                    <td>{h.quantity}</td>
                    <td>{formatInr(h.avgCost)}</td>
                    <td>{formatInr(h.currentPrice)}</td>
                    <td>{formatInr(h.marketValue)}</td>
                    <td className={h.unrealizedPnl >= 0 ? "positive" : "negative"}>
                      {formatInr(h.unrealizedPnl)}
                    </td>
                    <td>{formatPercent(h.allocationPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
