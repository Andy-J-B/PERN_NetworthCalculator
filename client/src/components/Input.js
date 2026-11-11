// ---------------------------------------------------------------
// client/src/components/Input.js – add a new snapshot
// ---------------------------------------------------------------

import React, { useState, useContext, useCallback } from "react";
import { NetWorthContext } from "../App";
import Toast from "./Toast";
import MoneyField from "./MoneyField";
import {
  ASSET_FIELDS,
  LIABILITY_FIELDS,
  computeTotal,
  formatMoney,
  sanitizeNumericInput,
} from "../config/fields";
import "../css/Input.css";

const initVals = () => ({
  cash_on_hand: "",
  cash_in_bank: "",
  accounts_receivable: "",
  accounts_payable: "",
  canada_stock: "",
  us_stock: "",
});

const Input = () => {
  const [values, setValues] = useState(initVals);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const { addNetWorth, apiBase } = useContext(NetWorthContext);

  const onChange = useCallback((name, raw) => {
    setValues((prev) => ({ ...prev, [name]: sanitizeNumericInput(raw) }));
  }, []);

  const total = computeTotal(values);
  const hasAnyValue = Object.values(values).some((v) => v !== "" && v !== "0");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const body = { ...values, total_networth: total.toFixed(2) };

      const resp = await fetch(`${apiBase}/networth_calculator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error(`Could not save (HTTP ${resp.status})`);
      const saved = await resp.json();

      addNetWorth(saved);
      setToast({ message: "Snapshot added", type: "success" });
      setValues(initVals());
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
      <h2 className="form-title">Add a snapshot</h2>

      <form className="networth-form" onSubmit={onSubmit}>
        <section className="field-section">
          <h3 className="field-section-title">Assets</h3>
          <div className="money-grid">
            {ASSET_FIELDS.map((f) => (
              <MoneyField
                key={f.name}
                field={f}
                idPrefix="add"
                value={values[f.name]}
                onChange={onChange}
              />
            ))}
          </div>
        </section>

        <section className="field-section">
          <h3 className="field-section-title is-liability">Liabilities</h3>
          <div className="money-grid">
            {LIABILITY_FIELDS.map((f) => (
              <MoneyField
                key={f.name}
                field={f}
                idPrefix="add"
                value={values[f.name]}
                onChange={onChange}
                negative
              />
            ))}
          </div>
        </section>

        <div className="computed-total">
          <span className="computed-total-label">Total net worth</span>
          <strong className="computed-total-value">{formatMoney(total)}</strong>
          <span className="computed-total-delta">
            Blank fields are treated as zero.
          </span>
        </div>

        <button type="submit" disabled={submitting || !hasAnyValue}>
          {submitting ? (
            <>
              <span className="spinner" />
              Saving…
            </>
          ) : (
            "Add snapshot"
          )}
        </button>
      </form>

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