/**
 * Formats a number as INR currency, e.g. 1000000 -> "₹10,00,000.00"
 * Returns a placeholder if the value is null/undefined (data not loaded yet).
 */
export function formatInr(amount) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a percentage value, e.g. 2.4 -> "+2.40%", -1.1 -> "-1.10%"
 */
export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
