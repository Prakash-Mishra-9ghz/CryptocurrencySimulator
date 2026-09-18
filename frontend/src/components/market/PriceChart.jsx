import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApiData } from "../../hooks/useApiData";
import { getAssetHistory } from "../../services/marketService";
import { LoadingState, ErrorState } from "../common/States";
import { formatInr } from "../../utils/format";

const RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
];

export default function PriceChart({ assetId, accentColor }) {
  const [days, setDays] = useState(7);
  const { data, loading, error, refetch } = useApiData(
    () => getAssetHistory(assetId, days),
    [assetId, days]
  );

  return (
    <div className="price-chart">
      <div className="chart-range-toggle">
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            className={days === r.days ? "active" : ""}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <LoadingState message="Loading price history..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              stroke="var(--text-muted)"
              fontSize={11}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v) => formatInr(v)}
              stroke="var(--text-muted)"
              fontSize={11}
              width={90}
            />
            <Tooltip
              formatter={(value) => formatInr(value)}
              labelFormatter={(ts) => new Date(ts).toLocaleString("en-IN")}
              contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="priceInr" stroke={accentColor} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
