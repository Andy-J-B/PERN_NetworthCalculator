import React, { useState, useContext } from "react";
import { NetWorthContext } from "../App";
import "../css/Edit.css";

const Edit = ({ networth }) => {
  const { updateNetWorth, apiBase } = useContext(NetWorthContext);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    cash_on_hand: networth.cash_on_hand ?? "",
    cash_in_bank: networth.cash_in_bank ?? "",
    accounts_receivable: networth.accounts_receivable ?? "",
    accounts_payable: networth.accounts_payable ?? "",
    canada_stock: networth.canada_stock ?? "",
    us_stock: networth.us_stock ?? "",
    total_networth: networth.total_networth ?? "",
    today_date: networth.today_date ? networth.today_date.split("T")[0] : "",
  });

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
      <button className="btn btn-edit" onClick={() => setEditing(true)}>
        Edit
      </button>

      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit snapshot</h3>
            <form onSubmit={submitHandler}>
              <input
                type="date"
                name="today_date"
                value={values.today_date}
                onChange={changeHandler}
                required
              />
              <input
                type="number"
                name="cash_on_hand"
                placeholder="Cash on hand"
                value={values.cash_on_hand}
                onChange={changeHandler}
                step="0.01"
                required
              />
              <input
                type="number"
                name="cash_in_bank"
                placeholder="Cash in bank"
                value={values.cash_in_bank}
                onChange={changeHandler}
                step="0.01"
                required
              />
              <input
                type="number"
                name="accounts_receivable"
                placeholder="Accounts receivable"
                value={values.accounts_receivable}
                onChange={changeHandler}
                step="0.01"
                required
              />
              <input
                type="number"
                name="accounts_payable"
                placeholder="Accounts payable"
                value={values.accounts_payable}
                onChange={changeHandler}
                step="0.01"
                required
              />
              <input
                type="number"
                name="canada_stock"
                placeholder="Canada stocks"
                value={values.canada_stock}
                onChange={changeHandler}
                step="0.01"
                required
              />
              <input
                type="number"
                name="us_stock"
                placeholder="US stocks"
                value={values.us_stock}
                onChange={changeHandler}
                step="0.01"
                required
              />
              {/* total_networth optional – auto‑calculated if left empty */}
              <input
                type="number"
                name="total_networth"
                placeholder="Total net‑worth (auto‑calc if empty)"
                value={values.total_networth}
                onChange={changeHandler}
                step="0.01"
              />
              <div className="modal-actions">
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
        </div>
      )}
    </>
  );
};

export default Edit;
