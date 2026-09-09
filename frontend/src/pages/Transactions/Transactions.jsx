import { useApiData } from "../../hooks/useApiData";
import { getTransactions } from "../../services/transactionService";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { formatInr } from "../../utils/format";

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
              <tr key={tx.id}>
                <td>{new Date(tx.timestamp).toLocaleString("en-IN")}</td>
                <td>{tx.type}</td>
                <td>{tx.symbol}</td>
                <td>{tx.quantity}</td>
                <td>{formatInr(tx.executionPrice)}</td>
                <td>{formatInr(tx.tradeValue)}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
