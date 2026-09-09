import { Link } from "react-router-dom";
import { useApiData } from "../../hooks/useApiData";
import { getPortfolio } from "../../services/portfolioService";
import { getAssets } from "../../services/marketService";
import { getTransactions } from "../../services/transactionService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";

export default function Dashboard() {
  const portfolio = useApiData(getPortfolio, []);
  const assets = useApiData(getAssets, []);
  const transactions = useApiData(() => getTransactions({ limit: 5 }), []);

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <section>
        <h2>Portfolio Summary</h2>
        {portfolio.loading && <LoadingState />}
        {portfolio.error && <ErrorState message={portfolio.error} onRetry={portfolio.refetch} />}
        {portfolio.data && (
          <div className="summary-cards">
            <div className="card">
              <span>Total Value</span>
              <strong>{formatInr(portfolio.data.totalValue)}</strong>
            </div>
            <div className="card">
              <span>Available Cash</span>
              <strong>{formatInr(portfolio.data.availableCash)}</strong>
            </div>
            <div className="card">
              <span>Unrealized P&amp;L</span>
              <strong>
                {formatInr(portfolio.data.totalPnl)} ({formatPercent(portfolio.data.totalPnlPercent)})
              </strong>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2>Market Snapshot</h2>
        {assets.loading && <LoadingState />}
        {assets.error && <ErrorState message={assets.error} onRetry={assets.refetch} />}
        {assets.data && assets.data.length === 0 && <EmptyState message="No assets available." />}
        {assets.data && assets.data.length > 0 && (
          <ul className="asset-snapshot-list">
            {assets.data.map((asset) => (
              <li key={asset.assetId}>
                <Link to={`/market/${asset.assetId}`}>
                  {asset.symbol} — {formatInr(asset.priceInr)} ({formatPercent(asset.change24h)})
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/market">View all assets →</Link>
      </section>

      <section>
        <h2>Recent Transactions</h2>
        {transactions.loading && <LoadingState />}
        {transactions.error && (
          <ErrorState message={transactions.error} onRetry={transactions.refetch} />
        )}
        {transactions.data && transactions.data.length === 0 && (
          <EmptyState message="No transactions yet. Place your first trade from the Market page." />
        )}
        {transactions.data && transactions.data.length > 0 && (
          <ul className="transaction-list">
            {transactions.data.map((tx) => (
              <li key={tx.id}>
                {tx.type} {tx.quantity} {tx.symbol} @ {formatInr(tx.executionPrice)}
              </li>
            ))}
          </ul>
        )}
        <Link to="/transactions">View all transactions →</Link>
      </section>
    </div>
  );
}
