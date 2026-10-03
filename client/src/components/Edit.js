import React, { useState, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import { NetWorthContext } from "../App";
import "../css/Edit.css";

const Edit = ({ networth }) => {
  const { updateNetWorth, apiBase } = useContext(NetWorthContext);
  const [editing, setEditing] = useState(false);

  const valuesFrom = useCallback(
    (row) => ({
      cash_on_hand: row.cash_on_hand ?? "",
      cash_in_bank: row.cash_in_bank ?? "",
      accounts_receivable: row.accounts_receivable ?? "",
      accounts_payable: row.accounts_payable ?? "",
      canada_stock: row.canada_stock ?? "",
      us_stock: row.us_stock ?? "",
      total_networth: row.total_networth ?? "",
      today_date: row.today_date ? row.today_date.split("T")[0] : "",
    }),
    []
  );

  const [values, setValues] = useState(() => valuesFrom(networth));

  const openEditor = () => {
    setValues(valuesFrom(networth));
    setEditing(true);
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // If the user left total_networth blank, compute it automatically
      const {
        cash_on_hand = 0,
        cash_in_bank = 0,
        accounts_receivable = 0,
        accounts_payable = 0,
        canada_stock = 0,
        us_stock = 0,
      } = values;

      const autoTotal = (
        +cash_on_hand +
        +cash_in_bank +
        +accounts_receivable +
        +canada_stock +
        +us_stock -
        +accounts_payable
      ).toFixed(2);

      const payload = {
        ...values,
        total_networth:
          values.total_networth !== "" ? values.total_networth : autoTotal,
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
        throw new Error(errText || "Failed to update");
      }

      // Server returns the updated row; push it into context
      const updatedRow = await putRes.json();
      updateNetWorth(updatedRow);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <>
      <button className="btn btn-edit" onClick={openEditor}>
        Edit
      </button>

      {editing &&
        createPortal(
          <div
            className="nw-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditing(false);
            }}
          >
            <div className="nw-modal">
              <h3>Edit snapshot</h3>
              <form onSubmit={submitHandler}>
                {[
                  { name: "today_date", type: "date", step: undefined },
                  { name: "cash_on_hand", type: "number", step: "0.01" },
                  { name: "cash_in_bank", type: "number", step: "0.01" },
                  {
                    name: "accounts_receivable",
                    type: "number",
                    step: "0.01",
                  },
                  {
                    name: "accounts_payable",
                    type: "number",
                    step: "0.01",
                  },
                  { name: "canada_stock", type: "number", step: "0.01" },
                  { name: "us_stock", type: "number", step: "0.01" },
                ].map((f) => (
                  <input
                    key={f.name}
                    type={f.type}
                    name={f.name}
                    className="form-control"
                    placeholder={f.name.replace(/_/g, " ")}
                    value={values[f.name]}
                    onChange={changeHandler}
                    step={f.step}
                    required
                  />
                ))}
                <input
                  type="number"
                  name="total_networth"
                  className="form-control"
                  placeholder="Total net-worth (auto-calc if empty)"
                  value={values.total_networth}
                  onChange={changeHandler}
                  step="0.01"
                />
                <div className="nw-modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Edit;
