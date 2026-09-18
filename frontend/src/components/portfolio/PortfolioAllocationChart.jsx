import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getAssetAccent } from "../../utils/assetTheme";
import { formatInr } from "../../utils/format";

export default function PortfolioAllocationChart({ holdings, availableCash }) {
  const data = [
    ...holdings
      .filter((h) => h.marketValue !== null)
      .map((h) => ({ name: h.symbol, value: h.marketValue, color: getAssetAccent(h.symbol) })),
    { name: "Cash", value: availableCash, color: "#5A6089" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="var(--surface)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatInr(value)}
          contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
