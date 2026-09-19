import { useApiData } from "../../hooks/useApiData";
import { getPortfolio } from "../../services/portfolioService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";
import { getAssetAccent } from "../../utils/assetTheme";
import AnimatedNumber from "../../components/common/AnimatedNumber";
import PortfolioAllocationChart from "../../components/portfolio/PortfolioAllocationChart";
import PortfolioInsights from "../../components/portfolio/PortfolioInsights";

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
            <div className="card hero">
              <span>Total Value</span>
              <strong><AnimatedNumber value={data.totalValue} format={formatInr} /></strong>
            </div>
            <div className="card">
              <span>Available Cash</span>
              <strong><AnimatedNumber value={data.availableCash} format={formatInr} /></strong>
            </div>
            <div className="card">
              <span>Unrealized P&amp;L</span>
              <strong className={data.totalPnl >= 0 ? "positive" : "negative"}>
                <AnimatedNumber value={data.totalPnl} format={formatInr} /> ({formatPercent(data.totalPnlPercent)})
              </strong>
            </div>
          </div>

          {(!data.holdings || data.holdings.length === 0) && (
            <EmptyState message="No holdings yet. Buy an asset from the Market page to get started." />
          )}

          {data.holdings && data.holdings.length > 0 && (
            <PortfolioAllocationChart holdings={data.holdings} availableCash={data.availableCash} />
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
                  <tr key={h.assetId} style={{ "--accent": getAssetAccent(h.symbol) }}>
                    <td>
                      <span className="asset-chip">
                        <span className="dot" style={{ background: getAssetAccent(h.symbol) }} />
                        {h.symbol}
                      </span>
                    </td>
                    <td className="tabular-nums">{h.quantity}</td>
                    <td className="tabular-nums">{formatInr(h.avgCost)}</td>
                    <td className="tabular-nums">{formatInr(h.currentPrice)}</td>
                    <td className="tabular-nums">{formatInr(h.marketValue)}</td>
                    <td className={`tabular-nums ${h.unrealizedPnl >= 0 ? "positive" : "negative"}`}>
                      {formatInr(h.unrealizedPnl)}
                    </td>
                    <td className="tabular-nums">{formatPercent(h.allocationPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <PortfolioInsights />
        </>
      )}
    </div>
  );
}
