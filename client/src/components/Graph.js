/* client/src/components/Graph.js */
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "../css/Graph.css";

const NetWorthGraph = ({ networths }) => {
  // sort chronologically
  const sorted = [...networths].sort(
    (a, b) => new Date(a.today_date) - new Date(b.today_date)
  );

  // transform into chart‑friendly format
  const chartData = sorted.map((row) => ({
    date: new Date(row.today_date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    total: parseFloat(row.total_networth),
    delta: row.difference !== null ? parseFloat(row.difference) : 0,
  }));

  if (chartData.length < 2)
    return (
      <p className="graph-placeholder">Add more entries to see the chart.</p>
    );

  // overall stats for a quick overview
  const first = parseFloat(sorted[0].total_networth);
  const last = parseFloat(sorted[sorted.length - 1].total_networth);
  const overallChange = last - first;
  const overallPct = ((overallChange / first) * 100).toFixed(2);

  return (
    <div className="networth-graph">
      <h3>Net‑Worth Over Time</h3>

      {/* ---- Line chart – total net‑worth ------------------------------------- */}
      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={chartData}
          margin={{ top: 15, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip formatter={(v) => `$${v}`} />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#2c3e50"
            name="Total Net‑Worth"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* ---- Bar chart – Δ per period ------------------------------------------ */}
      <h4 className="mt-4">Period Δ (Δ from previous entry)</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip formatter={(v) => `$${v}`} />
          <Legend verticalAlign="top" />
          <Bar dataKey="delta" fill="#e74c3c" name="Δ (change)" />
        </BarChart>
      </ResponsiveContainer>

      {/* ---- Summary stats ---------------------------------------------------- */}
      <div className="summary-stats mt-4">
        <p>
          <strong>Current Net‑Worth:</strong> $
          {parseFloat(last).toLocaleString()}
        </p>
        <p>
          <strong>Overall Δ:</strong>{" "}
          <span
            className={overallChange >= 0 ? "diff-positive" : "diff-negative"}
          >
            {overallChange >= 0 ? "+" : ""}
            {overallChange.toFixed(2)} ({overallPct}%)
          </span>
        </p>
      </div>
    </div>
  );
};

export default NetWorthGraph;
