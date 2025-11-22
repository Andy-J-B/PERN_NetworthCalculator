// ---------------------------------------------------------------
// client/src/components/List.js – updated version
// ---------------------------------------------------------------

import React, { Fragment, useContext, useState } from "react";
import { NetWorthContext } from "../App";
import Edit from "./Edit";
import NetWorthGraph from "./Graph";
import "../css/List.css";

const List = () => {
  // -----------------------------------------------------------
  // Context values
  // -----------------------------------------------------------
  const {
    networths,
    loading,
    deleteNetWorth,
    apiBase,
    refresh, // optional – you can expose it from App if you like
  } = useContext(NetWorthContext);

  // -----------------------------------------------------------
  // Local UI state – only for delete‑spinner handling
  // -----------------------------------------------------------
  const [deletingId, setDeletingId] = useState(null);

  // -----------------------------------------------------------
  // Debug – you can keep it or delete it – does not affect UI
  // -----------------------------------------------------------
  console.log(
    "%c<List> rendered – rows:",
    "color:#8b5cf6;font-weight:bold",
    networths.length
  );

  // -----------------------------------------------------------
  // Helper – format the ISO date coming from PostgreSQL
  // -----------------------------------------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // -----------------------------------------------------------
  // DELETE handler – talks to the API **and** updates the context
  // -----------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`${apiBase}/networth_calculator/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // Update context (causes UI re‑render)
      deleteNetWorth(id);
      console.log("%cDelete successful – id:", "color:#10b981", id);
    } catch (err) {
      console.error("%cDelete failed –", "color:#ef4444", err);
      alert("Could not delete – see console for details.");
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------------------------------------
  // Helper – calculate the Δ that should be displayed.
  // If the row already has a stored `difference` column we use it.
  // Otherwise we compute it on‑the‑fly from the previous row.
  // -----------------------------------------------------------
  const getDelta = (row, idx) => {
    // 1️⃣ Prefer the stored value (may be null)
    if (row.difference !== undefined && row.difference !== null) {
      return row.difference;
    }

    // 2️⃣ Fall back to a computed value using the previous row
    const prev = networths[idx - 1];
    if (!prev) return null; // first row – no previous value

    // Both totals are strings from the DB → coerce to Number
    const diff = Number(row.total_networth) - Number(prev.total_networth);
    // if the conversion gave NaN (bad data) we treat it as null
    return isNaN(diff) ? null : diff;
  };

  // -----------------------------------------------------------
  // UI – loading, empty state, table, graph
  // -----------------------------------------------------------
  if (loading) {
    return (
      <div className="loader">
        <span className="spinner" /> Loading…
      </div>
    );
  }

  if (!networths.length) {
    return (
      <p className="empty-state">No records yet – add a snapshot above.</p>
    );
  }

  return (
    <Fragment>
      {/* ────── Card‑styled container (same as Input) ────── */}
      <section className="list-card">
        <div className="list-header">
          <h2 className="list-title">Historical Snapshots</h2>
          {/* Optional manual refresh (uncomment in App if you expose it) */}
          {/* {refresh && (
            <button className="btn btn-refresh" onClick={refresh}>
              ↻ Refresh
            </button>
          )} */}
        </div>

        {/* ────── Table wrapper – scroll on narrow screens ────── */}
        <div className="table-wrapper">
          <table className="networth-table">
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
              {networths.map((row, idx) => {
                const delta = getDelta(row, idx);
                // class for colour coding
                const deltaClass =
                  delta > 0
                    ? "diff-positive"
                    : delta < 0
                      ? "diff-negative"
                      : "";

                // formatted display – dash for unknown
                const deltaDisplay =
                  delta === null || delta === undefined
                    ? "-"
                    : `${delta > 0 ? "▲" : delta < 0 ? "▼" : ""} ${Number(
                        delta
                      ).toFixed(2)}`;

                return (
                  <tr key={row.networth_id}>
                    <td>{formatDate(row.today_date)}</td>
                    <td>{row.cash_on_hand}</td>
                    <td>{row.cash_in_bank}</td>
                    <td>{row.accounts_receivable}</td>
                    <td>{row.accounts_payable}</td>
                    <td>{row.canada_stock}</td>
                    <td>{row.us_stock}</td>
                    <td>{row.total_networth}</td>

                    {/* Δ column – colour and arrow */}
                    <td className={deltaClass}>{deltaDisplay}</td>

                    {/* Edit (your own component already renders a button) */}
                    <td>
                      <Edit networth={row} />
                    </td>

                    {/* Delete – shows spinner while request is pending */}
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(row.networth_id)}
                        disabled={deletingId === row.networth_id}
                      >
                        {deletingId === row.networth_id ? (
                          <span className="spinner btn-spinner" />
                        ) : (
                          <span className="icon-trash" aria-hidden="true">
                            🗑️
                          </span>
                        )}
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ────── Graph (unchanged) ────── */}
        <section className="graph-wrapper mt-5">
          <NetWorthGraph networths={networths} />
        </section>
      </section>
    </Fragment>
  );
};

export default List;
