import React from "react";
import { Line } from "react-chartjs-2";
import regression from "regression";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../css/Graph.css";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const NetWorthGraph = ({ networths }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (!networths || networths.length === 0) {
    return <p>No net worth data available.</p>;
  }

  const baseDate = new Date(networths[0].today_date).getTime();
  const daysSinceStart = (date) =>
    (new Date(date).getTime() - baseDate) / (1000 * 3600 * 24);

  const regressionNetWorth = networths.map((entry) => [
    daysSinceStart(entry.today_date),
    parseFloat(entry.total_networth),
  ]);

  const regressionAssets = networths.map((entry) => {
    const totalAssets =
      parseFloat(entry.cash_on_hand || 0) +
      parseFloat(entry.cash_in_bank || 0) +
      parseFloat(entry.us_stock || 0) +
      parseFloat(entry.canada_stock || 0) +
      parseFloat(entry.accounts_receivable || 0);
    return [daysSinceStart(entry.today_date), totalAssets];
  });

  const resultNetWorth = regression.linear(regressionNetWorth);
  const resultAssets = regression.linear(regressionAssets);

  const daysInYear = 365.25;
  const lastX = regressionNetWorth.at(-1)[0];

  const futureNetWorth5 = resultNetWorth.predict(lastX + daysInYear * 5)[1];
  const futureNetWorth10 = resultNetWorth.predict(lastX + daysInYear * 10)[1];
  const futureAssets5 = resultAssets.predict(lastX + daysInYear * 5)[1];
  const futureAssets10 = resultAssets.predict(lastX + daysInYear * 10)[1];

  const labels = networths.map((entry) => formatDate(entry.today_date));
  const values = networths.map((entry) => parseFloat(entry.total_networth));

  const assetValues = networths.map(
    (entry) =>
      parseFloat(entry.cash_on_hand || 0) +
      parseFloat(entry.cash_in_bank || 0) +
      parseFloat(entry.us_stock || 0) +
      parseFloat(entry.canada_stock || 0) +
      parseFloat(entry.accounts_receivable || 0)
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Total Net Worth",
        data: values,
        borderColor: "#27ae60",
        backgroundColor: "rgba(39, 174, 96, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#27ae60",
        pointHoverRadius: 8,
      },
      {
        label: "Total Assets",
        data: assetValues,
        borderColor: "#e67e22",
        backgroundColor: "rgba(230, 126, 34, 0.1)",
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: "#e67e22",
        pointHoverRadius: 8,
      },
      {
        label: "Net Worth Trend",
        data: regressionNetWorth.map((pt) => resultNetWorth.predict(pt[0])[1]),
        borderColor: "#2980b9",
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Assets Trend",
        data: regressionAssets.map((pt) => resultAssets.predict(pt[0])[1]),
        borderColor: "#f1c40f",
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `Value: $${tooltipItem.raw.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "USD ($)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div className="graph-container">
      <h3>Net Worth Over Time</h3>
      <div className="canvas-container">
        <Line data={data} options={options} />
      </div>
      <div className="prediction-text">
        <p>
          📈 Based on your current trend:
          <br />
          <strong>Net Worth in 5 years:</strong> $
          {futureNetWorth5.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
          <br />
          <strong>Net Worth in 10 years:</strong> $
          {futureNetWorth10.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
          <br />
          <strong>Total Assets in 5 years:</strong> $
          {futureAssets5.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          <br />
          <strong>Total Assets in 10 years:</strong> $
          {futureAssets10.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default NetWorthGraph;
