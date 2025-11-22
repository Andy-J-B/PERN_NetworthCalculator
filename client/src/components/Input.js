/* client/src/components/Input.js */
import React, { useState, useContext } from "react";
import { NetWorthContext } from "../App";
import Toast from "./Toast";
import "../css/Input.css";

const Input = () => {
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

  const onChange = (e) => {
    const { name, value } = e.target;
    // keep empty string for controlled input, otherwise parseFloat
    setValues((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ---- 1️⃣ calculate total net‑worth on the client ---------------
      const {
        cash_on_hand = 0,
        cash_in_bank = 0,
        accounts_receivable = 0,
        accounts_payable = 0,
        canada_stock = 0,
        us_stock = 0,
      } = values;

      const total_networth = (
        +cash_on_hand +
        +cash_in_bank +
        +accounts_receivable +
        +canada_stock +
        +us_stock -
        +accounts_payable
      ).toFixed(2);

      const body = {
        cash_on_hand,
        cash_in_bank,
        accounts_receivable,
        accounts_payable,
        canada_stock,
        us_stock,
        total_networth,
      };

      // ---- 2️⃣ POST to the API ---------------------------------------
      const resp = await fetch(`${apiBase}/networth_calculator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error("Server error");

      const saved = await resp.json();

      // ---- 3️⃣ Optimistically update UI -------------------------------
      addNetWorth(saved);
      setToast({ message: "Snapshot added! 🎉", type: "success" });
      setValues(initVals); // clear form
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
    <section className="form-section">
      <h2>Add New Snapshot</h2>

      <form className="networth-form" onSubmit={onSubmit}>
        <input
          type="number"
          name="cash_on_hand"
          placeholder="Cash on hand"
          value={values.cash_on_hand}
          onChange={onChange}
          step="0.01"
          required
        />
        <input
          type="number"
          name="cash_in_bank"
          placeholder="Cash in bank"
          value={values.cash_in_bank}
          onChange={onChange}
          step="0.01"
          required
        />
        <input
          type="number"
          name="accounts_receivable"
          placeholder="Accounts receivable"
          value={values.accounts_receivable}
          onChange={onChange}
          step="0.01"
          required
        />
        <input
          type="number"
          name="accounts_payable"
          placeholder="Accounts payable"
          value={values.accounts_payable}
          onChange={onChange}
          step="0.01"
          required
        />
        <input
          type="number"
          name="canada_stock"
          placeholder="Canada stocks"
          value={values.canada_stock}
          onChange={onChange}
          step="0.01"
          required
        />
        <input
          type="number"
          name="us_stock"
          placeholder="US stocks"
          value={values.us_stock}
          onChange={onChange}
          step="0.01"
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Add"}
        </button>
      </form>

      {/* Toast – tiny overlay that disappears after 3 s */}
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
