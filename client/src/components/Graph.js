// ---------------------------------------------------------------
// client/src/components/Graph.js – enhanced multi‑view chart
// ---------------------------------------------------------------

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "../css/Graph.css";

const NetWorthGraph = ({ networths }) => {
  const [view, setView] = useState("all"); // all | networth | assets | liabilities | stocks

  // -----------------------------------------------------------------
  // Prepare data – sort chronologically and **calculate Δ on‑the‑fly**
  // -----------------------------------------------------------------
  const sorted = [...networths].sort(
    (a, b) => new Date(a.today_date) - new Date(b.today_date)
  );

  // we'll keep a running reference to the previous net‑worth
  let previousNet = null;

  const chartData = sorted.map((row) => {
    // ----- basic numeric fields (guard against null / empty strings) -----
    const cash_on_hand = parseFloat(row.cash_on_hand) || 0;
    const cash_in_bank = parseFloat(row.cash_in_bank) || 0;
    const accounts_receivable = parseFloat(row.accounts_receivable) || 0;
    const accounts_payable = parseFloat(row.accounts_payable) || 0;
    const canada_stock = parseFloat(row.canada_stock) || 0;
    const us_stock = parseFloat(row.us_stock) || 0;

    // ----- assets & net‑worth -----------------------------------------
    const assets =
      cash_on_hand +
      cash_in_bank +
      accounts_receivable +
      canada_stock +
      us_stock;

    const networth =
      parseFloat(row.total_networth) || assets - accounts_payable;

    // Gross Worth = net worth + accounts payable (total assets before liabilities)
    const grossworth = networth + accounts_payable;

    // ----- Δ (difference) ---------------------------------------------
    // 1️⃣ try the value that may already be stored in the DB
    const storedDiff = row.difference != null ? Number(row.difference) : null;

    // 2️⃣ if DB value is missing or NaN, compute from the previous row
    const computedDiff = previousNet !== null ? networth - previousNet : 0; // first row => 0

    const delta =
      storedDiff != null && !isNaN(storedDiff) ? storedDiff : computedDiff;

    // remember this net‑worth for the next iteration
    previousNet = networth;

    // ----- final object passed to Recharts ----------------------------
    return {
      date: new Date(row.today_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      cash_on_hand,
      cash_in_bank,
      accounts_receivable,
      canada_stock,
      us_stock,
      assets,
      liabilities: accounts_payable,
      networth,
      grossworth,
      delta, // ← always a real number (0 for the very first point)
    };
  });

  // -----------------------------------------------------------------
  // Guard – we need at least two points to draw a meaningful chart
  // -----------------------------------------------------------------
  if (chartData.length < 2) {
    return (
      <p className="graph-placeholder">Add more entries to see the charts.</p>
    );
  }

  // -----------------------------------------------------------------
  // Overall net‑worth summary (used below the chart)
  // -----------------------------------------------------------------
  const firstNet = chartData[0].networth;
  const lastNet = chartData[chartData.length - 1].networth;
  const overallChange = lastNet - firstNet;
  const overallPct = ((overallChange / firstNet) * 100).toFixed(2);

  // -----------------------------------------------------------------
  // View selector buttons
  // -----------------------------------------------------------------
  const viewOptions = [
    { value: "all", label: "All" },
    { value: "networth", label: "Net Worth" },
    { value: "assets", label: "Assets" },
    { value: "liabilities", label: "Liabilities" },
    { value: "stocks", label: "Stocks" },
  ];

  // -----------------------------------------------------------------
  // Build the appropriate series for the current view
  // -----------------------------------------------------------------
  const buildSeries = () => {
    const series = [];

    // Net‑worth line (always shown in "networth" and "all")
    if (view === "all" || view === "networth") {
      series.push(
        <Line
          key="networth"
          type="monotone"
          dataKey="networth"
          stroke="#2c3e50"
          name="Net Worth"
          dot={{ r: 4 }}
        />
      );
    }

    // Gross Worth line (net worth + accounts payable = total assets)
    if (view === "all") {
      series.push(
        <Line
          key="grossworth"
          type="monotone"
          dataKey="grossworth"
          stroke="#16a085"
          name="Gross Worth"
          dot={{ r: 4 }}
          strokeDasharray="5 5"
        />
      );
    }

    // Stacked assets area (shown in "assets" and "all")
    if (view === "all" || view === "assets") {
      series.push(
        <Area
          key="cash_on_hand"
          type="monotone"
          dataKey="cash_on_hand"
          stackId="assets"
          stroke="#1abc9c"
          fill="#1abc9c"
          name="Cash On Hand"
        />,
        <Area
          key="cash_in_bank"
          type="monotone"
          dataKey="cash_in_bank"
          stackId="assets"
          stroke="#3498db"
          fill="#3498db"
          name="Cash In Bank"
        />,
        <Area
          key="accounts_receivable"
          type="monotone"
          dataKey="accounts_receivable"
          stackId="assets"
          stroke="#9b59b6"
          fill="#9b59b6"
          name="Accounts Receivable"
        />,
        <Area
          key="canada_stock"
          type="monotone"
          dataKey="canada_stock"
          stackId="assets"
          stroke="#e67e22"
          fill="#e67e22"
          name="Canada Stocks"
        />,
        <Area
          key="us_stock"
          type="monotone"
          dataKey="us_stock"
          stackId="assets"
          stroke="#e74c3c"
          fill="#e74c3c"
          name="US Stocks"
        />
      );
    }

    // Liabilities line (shown in "liabilities" and "all")
    if (view === "all" || view === "liabilities") {
      series.push(
        <Line
          key="liabilities"
          type="monotone"
          dataKey="liabilities"
          stroke="#e74c3c"
          name="Liabilities"
          dot={false}
        />
      );
    }

    // Stocks‑only view – two separate lines for each market
    if (view === "stocks") {
      series.push(
        <Line
          key="canada_stock_line"
          type="monotone"
          dataKey="canada_stock"
          stroke="#e67e22"
          name="Canada Stocks"
          dot={false}
        />,
        <Line
          key="us_stock_line"
          type="monotone"
          dataKey="us_stock"
          stroke="#e74c3c"
          name="US Stocks"
          dot={false}
        />
      );
    }

    // Period Δ bar – displayed for net‑worth‑related views
    if (view === "all" || view === "networth" || view === "assets") {
      series.push(
        <Bar
          key="delta"
          dataKey="delta"
          barSize={12}
          fill="#7f8c8d"
          name="Δ (Δ per period)"
        />
      );
    }

    return series;
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="networth-graph">
      <h3>Financial Overview</h3>

      {/* View selector */}
      <div className="view-selector">
        {viewOptions.map((opt) => (
          <button
            key={opt.value}
            className={`view-btn ${view === opt.value ? "active" : ""}`}
            onClick={() => setView(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            allowDecimals={false}
          />
          <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
          <Legend verticalAlign="top" height={36} />
          {buildSeries()}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary statistics */}
      <div className="summary-stats mt-4">
        <p>
          <strong>Current Net‑Worth:</strong> ${lastNet.toLocaleString()}
        </p>
        <p>
          <strong>Current Gross Worth:</strong> ${chartData[chartData.length - 1].grossworth.toLocaleString()}
        </p>
        <p>
          <strong>Total Assets:</strong> $
          {chartData[chartData.length - 1].assets.toLocaleString()}
        </p>
        <p>
          <strong>Total Liabilities:</strong> $
          {chartData[chartData.length - 1].liabilities.toLocaleString()}
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
