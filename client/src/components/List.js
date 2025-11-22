// client/src/components/List.js
import React, { Fragment, useContext, useState } from "react";
import { NetWorthContext } from "../App";
import Edit from "./Edit";
import "../css/List.css";
import NetWorthGraph from "./Graph";

const List = () => {
  // --------------------------------------------------------------
  // Pull everything we need from the shared context
  // --------------------------------------------------------------
  const { networths, loading, deleteNetWorth, apiBase } =
    useContext(NetWorthContext);

  // --------------------------------------------------------------
  // Local UI state (only for visual “deleting…” feedback)
  // --------------------------------------------------------------
  const [deletingId, setDeletingId] = useState(null);

  // --------------------------------------------------------------
  // Debug: show that the component received data from context
  // --------------------------------------------------------------
  console.log(
    "%c<List> rendered – rows:",
    "color:#8b5cf6;font-weight:bold",
    networths.length
  );

  // --------------------------------------------------------------
  // Helper – pretty‑print the ISO date that comes from PostgreSQL
  // --------------------------------------------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --------------------------------------------------------------
  // DELETE handler – talks to the API **and** updates context state
  // --------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`${apiBase}/networth_calculator/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // Update context (which also triggers the UI to re‑render)
      deleteNetWorth(id);
      console.log("%cDelete successful – id:", "color:#10b981", id);
    } catch (err) {
      console.error("%cDelete failed –", "color:#ef4444", err);
      alert("Could not delete – see console for details.");
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------------------
  // UI – Loading, Empty‑state, Table, Graph
  // --------------------------------------------------------------
  if (loading) return <div className="loader">Loading…</div>;

  if (!networths.length) {
    return (
      <p className="empty-state">No records yet – add a snapshot above.</p>
    );
  }

  return (
    <Fragment>
      <table className="table mt-5 text-center">
        <thead>
          <tr>
            <th>Date</th>
            <th>Cash On Hand</th>
            <th>Cash In Bank</th>
            <th>Accounts Receivable</th>
            <th>Accounts Payable</th>
            <th>Canada Stocks</th>
            <th>US Stocks</th>
            <th>Total Net‑Worth</th>
            <th>Δ</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {networths.map((row) => (
            <tr key={row.networth_id}>
              <td>{formatDate(row.today_date)}</td>
              <td>{row.cash_on_hand}</td>
              <td>{row.cash_in_bank}</td>
              <td>{row.accounts_receivable}</td>
              <td>{row.accounts_payable}</td>
              <td>{row.canada_stock}</td>
              <td>{row.us_stock}</td>
              <td>{row.total_networth}</td>

              {/* Δ (difference) – colour‑coded */}
              <td
                className={
                  row.difference > 0
                    ? "diff-positive"
                    : row.difference < 0
                      ? "diff-negative"
                      : ""
                }
              >
                {row.difference !== null
                  ? Number(row.difference).toFixed(2)
                  : "-"}
              </td>

              <td>
                <Edit networth={row} />
              </td>

              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(row.networth_id)}
                  disabled={deletingId === row.networth_id}
                >
                  {deletingId === row.networth_id ? "…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="graph-container mt-5">
        <NetWorthGraph networths={networths} />
      </section>
    </Fragment>
  );
};

export default List;
