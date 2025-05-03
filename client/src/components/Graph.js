import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../css/Graph.css"; // Import the CSS file

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const getLinearRegression = (x, y) => {
  const n = x.length;
  const xMean = x.reduce((a, b) => a + b) / n;
  const yMean = y.reduce((a, b) => a + b) / n;

  const numerator = x.reduce(
    (sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean),
    0
  );
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
};

const yearsFromNow = (date1, date2) =>
  (date2 - date1) / (1000 * 60 * 60 * 24 * 365.25);

const NetWorthGraph = ({ networths }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  if (!networths || networths.length === 0) {
    return <p>No net worth data available.</p>;
  }

  console.log(networths);
  const baseDate = new Date(networths[0].today_date);
  const xValues = networths.map((entry) =>
    yearsFromNow(baseDate, new Date(entry.today_date))
  );
  const totalNetWorths = networths.map((entry) =>
    parseFloat(entry.total_networth)
  );
  const totalAssets = networths.map(
    (entry) =>
      parseFloat(entry.cash_on_hand) +
      parseFloat(entry.cash_in_bank) +
      parseFloat(entry.accounts_receivable) +
      parseFloat(entry.canada_stock) +
      parseFloat(entry.us_stock)
  );

  const netWorthModel = getLinearRegression(xValues, totalNetWorths);
  const assetModel = getLinearRegression(xValues, totalAssets);

  const predictYears = [5, 10];
  const netWorthPredictions = predictYears.map(
    (year) => netWorthModel.slope * year + netWorthModel.intercept
  );
  const assetPredictions = predictYears.map(
    (year) => assetModel.slope * year + assetModel.intercept
  );

  const data = {
    labels: networths.map((entry) => formatDate(entry.today_date)),
    datasets: [
      {
        label: "Total Net Worth",
        data: networths.map((entry) => entry.total_networth),
        borderColor: "#27ae60",
        backgroundColor: "rgba(39, 174, 96, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#27ae60",
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "Arial, sans-serif",
            weight: "bold",
          },
          color: "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `Net Worth: $${tooltipItem.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#555",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.2)", // Light grid lines
        },
      },
      y: {
        title: {
          display: true,
          text: "Net Worth ($)",
          color: "#555",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="graph-container">
      <h3>Net Worth Over Time</h3>
      <div className="canvas-container">
        <Line data={data} options={options} />
      </div>
      <div className="prediction-summary">
        <h4>Predicted Net Worth & Assets</h4>
        <ul>
          <li>
            <strong>In 5 years:</strong> Net Worth ≈ $
            {netWorthPredictions[0]
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Assets ≈ $
            {assetPredictions[0]
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </li>
          <li>
            <strong>In 10 years:</strong> Net Worth ≈ $
            {netWorthPredictions[1]
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Assets ≈ $
            {assetPredictions[1]
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NetWorthGraph;
