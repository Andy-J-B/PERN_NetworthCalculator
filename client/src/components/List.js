// ---------------------------------------------------------------
// client/src/components/List.js – historical snapshot table
// ---------------------------------------------------------------

import React, { Fragment, useContext, useState, useCallback } from "react";
import { NetWorthContext } from "../App";
import Edit from "./Edit";
import Toast from "./Toast";
import NetWorthGraph from "./Graph";
import { formatMoney, formatSignedMoney, num } from "../config/fields";
import "../css/List.css";

const List = () => {
  const { networths, loading, deleteNetWorth, apiBase } =
    useContext(NetWorthContext);

  // confirmId  – row awaiting delete confirmation
  // deletingId – row whose DELETE request is in flight
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // -----------------------------------------------------------------
  // Delete – two-step inline confirmation instead of window.confirm
  // -----------------------------------------------------------------
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const resp = await fetch(`${apiBase}/networth_calculator/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      deleteNetWorth(id);
      setConfirmId(null);
      setToast({ message: "Snapshot deleted", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Could not delete that entry", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------------------------------------------
  // Δ – derived from the previous row. There is no `difference`
  // column in the schema, so this is the single source of truth.
  // -----------------------------------------------------------------
  const getDelta = (row, idx) => {
    if (idx === 0) return null;
    return num(row.total_networth) - num(networths[idx - 1].total_networth);
  };

  if (loading) {
    return (
      <div className="loader">
        <span className="spinner" /> Loading…
      </div>
    );
  }

  if (!networths.length) {
    return (
      <section className="list-card empty-card">
        <div className="empty-state">
          <p className="empty-title">No snapshots yet</p>
          <p className="empty-sub">
            Add your first snapshot above to start tracking your net worth over
            time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <Fragment>
      <section className="list-card">
        <div className="list-header">
          <h2 className="list-title">Historical Snapshots</h2>
          <span className="list-count">
            {networths.length} {networths.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="networth-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col" className="num">Cash on hand</th>
                <th scope="col" className="num">Cash in bank</th>
                <th scope="col" className="num">Receivable</th>
                <th scope="col" className="num">Payable</th>
                <th scope="col" className="num">Canada stocks</th>
                <th scope="col" className="num">US stocks</th>
                <th scope="col" className="num">Net worth</th>
                <th scope="col" className="num">Δ</th>
                <th scope="col" className="actions-col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {networths.map((row, idx) => {
                const delta = getDelta(row, idx);
                const deltaClass =
                  delta > 0
                    ? "diff-positive"
                    : delta < 0
                      ? "diff-negative"
                      : "";
                const confirming = confirmId === row.networth_id;
                const deleting = deletingId === row.networth_id;

                return (
                  <tr key={row.networth_id}>
                    <td className="date-cell">{formatDate(row.today_date)}</td>
                    <td className="num">{formatMoney(row.cash_on_hand)}</td>
                    <td className="num">{formatMoney(row.cash_in_bank)}</td>
                    <td className="num">
                      {formatMoney(row.accounts_receivable)}
                    </td>
                    <td className="num">
                      {formatMoney(row.accounts_payable)}
                    </td>
                    <td className="num">{formatMoney(row.canada_stock)}</td>
                    <td className="num">{formatMoney(row.us_stock)}</td>
                    <td className="num strong">
                      {formatMoney(row.total_networth)}
                    </td>

                    <td className={`num ${deltaClass}`}>
                      {delta === null ? (
                        <span className="diff-none">—</span>
                      ) : (
                        <>
                          <span aria-hidden="true">
                            {delta > 0 ? "▲" : delta < 0 ? "▼" : ""}
                          </span>
                          {formatSignedMoney(delta)}
                        </>
                      )}
                    </td>

                    <td className="actions-col">
                      {confirming ? (
                        <div className="confirm-row">
                          <span className="confirm-text">Delete?</span>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(row.networth_id)}
                            disabled={deleting}
                            autoFocus
                          >
                            {deleting ? "…" : "Yes"}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setConfirmId(null)}
                            disabled={deleting}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <Edit networth={row} />
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => setConfirmId(row.networth_id)}
                            aria-label={`Delete snapshot from ${formatDate(
                              row.today_date
                            )}`}
                          >
                            <span aria-hidden="true">🗑</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <section className="graph-wrapper mt-5">
          <NetWorthGraph networths={networths} />
        </section>
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Fragment>
  );
};

export default List;