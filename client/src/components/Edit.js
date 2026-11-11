// ---------------------------------------------------------------
// client/src/components/Edit.js – edit a snapshot in a modal
// ---------------------------------------------------------------

import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { NetWorthContext } from "../App";
import Toast from "./Toast";
import MoneyField from "./MoneyField";
import {
  ASSET_FIELDS,
  LIABILITY_FIELDS,
  computeTotal,
  formatMoney,
  formatSignedMoney,
  sanitizeNumericInput,
} from "../config/fields";
import "../css/Edit.css";

const blankValues = () => ({
  cash_on_hand: "",
  cash_in_bank: "",
  accounts_receivable: "",
  accounts_payable: "",
  canada_stock: "",
  us_stock: "",
  today_date: "",
});

const valuesFromRow = (row) => {
  const v = blankValues();
  [...ASSET_FIELDS, ...LIABILITY_FIELDS].forEach((f) => {
    v[f.name] =
      row?.[f.name] === null || row?.[f.name] === undefined
        ? ""
        : String(row[f.name]);
  });
  // Keep today_date in the same shape as everything else so it is
  // always present in the PUT payload rather than relying on the
  // server's COALESCE to preserve it.
  v.today_date = row?.today_date ? String(row.today_date).split("T")[0] : "";
  return v;
};

const Edit = ({ networth }) => {
  const { updateNetWorth, apiBase } = useContext(NetWorthContext);

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => valuesFromRow(networth));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);

  const close = useCallback(() => setEditing(false), []);

  const openEditor = () => {
    restoreFocusRef.current = document.activeElement;
    setValues(valuesFromRow(networth));
    setEditing(true);
  };

  const changeHandler = useCallback((name, raw) => {
    setValues((prev) => ({ ...prev, [name]: sanitizeNumericInput(raw) }));
  }, []);

  // -----------------------------------------------------------------
  // Modal behaviour: Escape to close, scroll lock, simple focus trap
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!editing) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }

      // Keep Tab inside the dialog
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so keyboard users are not stranded
    const t = setTimeout(() => {
      dialogRef.current
        ?.querySelector("input, button")
        ?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(t);
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [editing, close]);

  // -----------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------
  const originalTotal = computeTotal(networth);
  const previewTotal = computeTotal(values);
  const totalDelta = previewTotal - originalTotal;

  const submitHandler = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        ...values,
        total_networth: previewTotal.toFixed(2),
      };

      const putRes = await fetch(
        `${apiBase}/networth_calculator/${networth.networth_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(errText || `Failed to update (HTTP ${putRes.status})`);
      }

      const updatedRow = await putRes.json();
      updateNetWorth(updatedRow);
      close();
      setToast({ message: "Snapshot updated", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || "Could not save changes", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-edit" onClick={openEditor}>
        Edit
        <span className="sr-only"> snapshot from {networth.today_date}</span>
      </button>

      {editing &&
        createPortal(
          // NOTE: onMouseDown, not onClick. A drag that starts inside an
          // input and ends outside fires click on this overlay, which
          // closed the modal mid-selection. mousedown only fires where
          // the press actually began, so text selection never dismisses.
          <div
            className="nw-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div
              className="nw-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="nw-modal-title"
              ref={dialogRef}
            >
              <header className="nw-modal-header">
                <h3 id="nw-modal-title">Edit snapshot</h3>
                <button
                  type="button"
                  className="nw-modal-close"
                  onClick={close}
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </header>

              <form onSubmit={submitHandler} className="nw-modal-body">
                <div className="nw-modal-date">
                  <label className="money-field-label" htmlFor="nw-edit-date">
                    Snapshot date
                  </label>
                  <input
                    id="nw-edit-date"
                    type="date"
                    value={values.today_date}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        today_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <section className="field-section">
                  <h4 className="field-section-title">Assets</h4>
                  <div className="money-grid">
                    {ASSET_FIELDS.map((f, i) => (
                      <MoneyField
                        key={f.name}
                        field={f}
                        idPrefix="nw-edit"
                        value={values[f.name]}
                        onChange={changeHandler}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </section>

                <section className="field-section">
                  <h4 className="field-section-title is-liability">
                    Liabilities
                  </h4>
                  <div className="money-grid">
                    {LIABILITY_FIELDS.map((f) => (
                      <MoneyField
                        key={f.name}
                        field={f}
                        idPrefix="nw-edit"
                        value={values[f.name]}
                        onChange={changeHandler}
                        negative
                      />
                    ))}
                  </div>
                </section>

                <div className="computed-total">
                  <span className="computed-total-label">
                    Net worth after edit
                  </span>
                  <strong className="computed-total-value">
                    {formatMoney(previewTotal)}
                  </strong>
                  {totalDelta !== 0 && (
                    <span className="computed-total-delta">
                      {totalDelta > 0 ? "▲ " : "▼ "}
                      <span className={totalDelta > 0 ? "up" : "down"}>
                        {formatSignedMoney(totalDelta)}
                      </span>{" "}
                      vs. {formatMoney(originalTotal)} before
                    </span>
                  )}
                </div>

                <div className="nw-modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={close}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Edit;