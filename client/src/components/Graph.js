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

const NetWorthGraph = ({ networths }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };
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
    </div>
  );
};

export default NetWorthGraph;
