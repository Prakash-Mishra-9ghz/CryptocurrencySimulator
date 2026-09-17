import { useApiData } from "../../hooks/useApiData";
import { getTransactions } from "../../services/transactionService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr } from "../../utils/format";
import { getAssetAccent } from "../../utils/assetTheme";
import Pill from "../../components/common/Pill";

export default function Transactions() {
  const { data, loading, error, refetch } = useApiData(() => getTransactions(), []);

  return (
    <div className="transactions-page">
      <h1>Transaction History</h1>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {data && data.length === 0 && (
        <EmptyState message="No transactions yet. Trades you make will appear here." />
      )}

      {data && data.length > 0 && (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Execution Price</th>
              <th>Total Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => (
              <tr key={tx.id} style={{ "--accent": getAssetAccent(tx.symbol) }}>
                <td>{new Date(tx.timestamp).toLocaleString("en-IN")}</td>
                <td>
                  <Pill tone={tx.type === "BUY" ? "positive" : "negative"}>{tx.type}</Pill>
                </td>
                <td>
                  <span className="asset-chip">
                    <span className="dot" style={{ background: getAssetAccent(tx.symbol) }} />
                    {tx.symbol}
                  </span>
                </td>
                <td className="tabular-nums">{tx.quantity}</td>
                <td className="tabular-nums">{formatInr(tx.executionPrice)}</td>
                <td className="tabular-nums">{formatInr(tx.tradeValue)}</td>
                <td><Pill tone="neutral">{tx.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
