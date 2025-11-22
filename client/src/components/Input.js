// client/src/components/Input.js
import React, { useState, useContext } from "react";
import { NetWorthContext } from "../App";
import Toast from "./Toast";
import "../css/Input.css";

const Input = () => {
  // ---- initial (empty) values -------------------------------------------------
  const initVals = {
    cash_on_hand: "",
    cash_in_bank: "",
    accounts_receivable: "",
    accounts_payable: "",
    canada_stock: "",
    us_stock: "",
  };

  const [values, setValues] = useState(initVals);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const { addNetWorth, apiBase } = useContext(NetWorthContext);

  // ---- update a single field --------------------------------------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      // keep an empty string for a controlled input, otherwise parseFloat
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  // ---- compute the total net‑worth on‑the‑fly (for preview) -------------------
  const computeTotal = () => {
    const {
      cash_on_hand = 0,
      cash_in_bank = 0,
      accounts_receivable = 0,
      accounts_payable = 0,
      canada_stock = 0,
      us_stock = 0,
    } = values;

    const total =
      +cash_on_hand +
      +cash_in_bank +
      +accounts_receivable +
      +canada_stock +
      +us_stock -
      +accounts_payable;

    return isNaN(total) ? "" : total.toFixed(2);
  };

  // ---- submit ---------------------------------------------------------------
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const total_networth = computeTotal();

      const body = {
        cash_on_hand: values.cash_on_hand,
        cash_in_bank: values.cash_in_bank,
        accounts_receivable: values.accounts_receivable,
        accounts_payable: values.accounts_payable,
        canada_stock: values.canada_stock,
        us_stock: values.us_stock,
        total_networth,
      };

      const resp = await fetch(`${apiBase}/networth_calculator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error("Server error");
      const saved = await resp.json();

      // Optimistic UI update – add the newly saved row to the context list
      addNetWorth(saved);
      setToast({ message: "Snapshot added! 🎉", type: "success" });
      setValues(initVals); // reset the form
    } catch (err) {
      console.error(err);
      setToast({
        message: err.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-container">
      <h1>Net Worth Calculator</h1>

      <form className="networth-form" onSubmit={onSubmit} noValidate>
        {/* ---- numeric inputs – same layout, mobile‑friendly ---------- */}
        <input
          type="number"
          name="cash_on_hand"
          placeholder="Cash on hand"
          value={values.cash_on_hand}
          onChange={onChange}
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="cash_in_bank"
          placeholder="Cash in bank"
          value={values.cash_in_bank}
          onChange={onChange}
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="accounts_receivable"
          placeholder="Accounts receivable"
          value={values.accounts_receivable}
          onChange={onChange}
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="accounts_payable"
          placeholder="Accounts payable"
          value={values.accounts_payable}
          onChange={onChange}
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="canada_stock"
          placeholder="Canada stocks"
          value={values.canada_stock}
          onChange={onChange}
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="us_stock"
          placeholder="US stocks"
          value={values.us_stock}
          onChange={onChange}
          step="0.01"
          min="0"
          required
        />

        {/* ---- live preview of the calculated total -------------------- */}
        <div className="total-preview">
          <span>Total Net Worth:</span>
          <strong>
            {computeTotal()
              ? `$${Number(computeTotal()).toLocaleString()}`
              : "—"}
          </strong>
        </div>

        {/* ---- submit button – shows spinner while saving -------------- */}
        <button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" />
              Saving…
            </>
          ) : (
            "Add"
          )}
        </button>
      </form>

      {/* ---- toast notification --------------------------------------- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default Input;
