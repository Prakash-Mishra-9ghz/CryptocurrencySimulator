import { Link } from "react-router-dom";
import { useApiData } from "../../hooks/useApiData";
import { getPortfolio } from "../../services/portfolioService";
import { getAssets } from "../../services/marketService";
import { getTransactions } from "../../services/transactionService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr, formatPercent } from "../../utils/format";
import { getAssetAccent } from "../../utils/assetTheme";
import AnimatedNumber from "../../components/common/AnimatedNumber";
import Pill from "../../components/common/Pill";

export default function Dashboard() {
  const portfolio = useApiData(getPortfolio, []);
  const assets = useApiData(getAssets, []);
  const transactions = useApiData(() => getTransactions({ limit: 5 }), []);

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <section>
        {portfolio.loading && <LoadingState />}
        {portfolio.error && <ErrorState message={portfolio.error} onRetry={portfolio.refetch} />}
        {portfolio.data && (
          <div className="summary-cards">
            <div className="card hero">
              <span>Total Portfolio Value</span>
              <strong>
                <AnimatedNumber value={portfolio.data.totalValue} format={formatInr} />
              </strong>
            </div>
            <div className="card">
              <span>Available Cash</span>
              <strong>
                <AnimatedNumber value={portfolio.data.availableCash} format={formatInr} />
              </strong>
            </div>
            <div className="card">
              <span>Unrealized P&amp;L</span>
              <strong className={portfolio.data.totalPnl >= 0 ? "positive" : "negative"}>
                <AnimatedNumber value={portfolio.data.totalPnl} format={formatInr} />{" "}
                <Pill tone={portfolio.data.totalPnl >= 0 ? "positive" : "negative"}>
                  {formatPercent(portfolio.data.totalPnlPercent)}
                </Pill>
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
          <table>
            <tbody>
              {assets.data.map((asset) => (
                <tr key={asset.assetId} style={{ "--accent": getAssetAccent(asset.symbol) }}>
                  <td>
                    <Link to={`/market/${asset.assetId}`} className="asset-chip">
                      <span className="dot" style={{ background: getAssetAccent(asset.symbol) }} />
                      {asset.symbol}
                    </Link>
                  </td>
                  <td className="tabular-nums">{formatInr(asset.priceInr)}</td>
                  <td className={`tabular-nums ${asset.change24h >= 0 ? "positive" : "negative"}`}>
                    {formatPercent(asset.change24h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link to="/market">View all assets</Link>
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
          <table>
            <tbody>
              {transactions.data.map((tx) => (
                <tr key={tx.id} style={{ "--accent": getAssetAccent(tx.symbol) }}>
                  <td>
                    <Pill tone={tx.type === "BUY" ? "positive" : "negative"}>{tx.type}</Pill>
                  </td>
                  <td>
                    {tx.quantity} {tx.symbol}
                  </td>
                  <td className="tabular-nums">{formatInr(tx.executionPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link to="/transactions">View all transactions</Link>
      </section>
    </div>
  );
}
