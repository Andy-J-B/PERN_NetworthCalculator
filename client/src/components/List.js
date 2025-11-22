/* client/src/components/List.js */
import React, { useContext, useState } from "react";
import { NetWorthContext } from "../App";
import Edit from "./Edit";
import NetWorthGraph from "./Graph";
import "../css/List.css";

const List = () => {
  const { networths, loading, deleteNetWorth, apiBase } =
    useContext(NetWorthContext);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`${apiBase}/networth_calculator/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok && resp.status !== 204) throw new Error("Delete failed");
      deleteNetWorth(id);
    } catch (e) {
      console.error(e);
      alert("Could not delete the entry.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <div className="loader">Loading…</div>;

  if (!networths.length) {
    return <p className="empty-state">No data yet – add a snapshot above.</p>;
  }

  return (
    <>
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
    </>
  );
};

export default List;
