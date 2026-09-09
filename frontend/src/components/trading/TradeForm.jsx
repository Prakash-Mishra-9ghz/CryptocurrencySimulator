import { useState } from "react";
import { buyAsset, sellAsset } from "../../services/tradeService";
import { formatInr } from "../../utils/format";

/**
 * IMPORTANT: the "estimated value" shown here is calculated from the
 * last fetched dashboard/market price purely for the user's convenience
 * before they submit. It is NOT the execution price. The backend fetches
 * a fresh price at execution time and that response is authoritative
 * (spec Section 17-18). onTradeComplete should trigger a refetch of
 * wallet/portfolio/holdings from the server, not from this estimate.
 */
export default function TradeForm({ asset, onTradeComplete }) {
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const numericQuantity = parseFloat(quantity);
  const estimatedValue =
    !Number.isNaN(numericQuantity) && numericQuantity > 0
      ? numericQuantity * asset.priceInr
      : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const action = side === "BUY" ? buyAsset : sellAsset;
      const data = await action({ assetId: asset.assetId, quantity: numericQuantity });
      setResult(data);
      setQuantity("");
      if (onTradeComplete) onTradeComplete(data);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          `${side} failed. Please check your balance/holdings and try again.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="trade-form" onSubmit={handleSubmit}>
      <div className="trade-side-toggle">
        <button
          type="button"
          className={side === "BUY" ? "active" : ""}
          onClick={() => setSide("BUY")}
        >
          Buy
        </button>
        <button
          type="button"
          className={side === "SELL" ? "active" : ""}
          onClick={() => setSide("SELL")}
        >
          Sell
        </button>
      </div>

      <label>
        Quantity
        <input
          type="number"
          step="any"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </label>

      <p className="estimated-value">
        Estimated value: {estimatedValue !== null ? formatInr(estimatedValue) : "—"}
        <br />
        <small>Final execution price is determined by the backend at trade time.</small>
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <p className="form-success">
          {side} executed at {formatInr(result?.transaction?.executionPrice)}.
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : `${side} ${asset.symbol}`}
      </button>
    </form>
  );
}
