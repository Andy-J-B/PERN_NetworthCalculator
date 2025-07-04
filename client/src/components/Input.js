import React, { Fragment, useState } from "react";
import "../css/Input.css";

const Input = () => {
  const initialValues = {
    cash_on_hand: "",
    cash_in_bank: "",
    accounts_receivable: "",
    accounts_payable: "",
    canada_stock: "",
    us_stock: "",
  };

  const [allValues, setAllValues] = useState(initialValues);

  const changeHandler = (e) => {
    setAllValues({ ...allValues, [e.target.name]: parseFloat(e.target.value) });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
      const body = { allValues };
      let nontoday = Object.assign({}, body["allValues"]);
      delete nontoday["accounts_payable"];
      delete nontoday["total_networth"];
      body["allValues"]["total_networth"] = (
        sumValues(nontoday) - parseFloat(body["allValues"]["accounts_payable"])
      ).toFixed(2);
      console.log(nontoday, body["allValues"]);
      const response = await fetch(
        "http://localhost:2938/networth_calculator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body["allValues"]),
        }
      );

      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <div className="form-container">
        <h1>Net Worth Calculator</h1>
        <form onSubmit={onSubmitForm}>
          <input
            type="number"
            id="cash_on_hand"
            name="cash_on_hand"
            value={allValues.cash_on_hand}
            onChange={changeHandler}
            placeholder="Cash On Hand"
          />
          <input
            type="number"
            id="cash_in_bank"
            name="cash_in_bank"
            value={allValues.cash_in_bank}
            onChange={changeHandler}
            placeholder="Cash In Bank"
          />
          <input
            type="number"
            id="accounts_receivable"
            name="accounts_receivable"
            value={allValues.accounts_receivable}
            onChange={changeHandler}
            placeholder="Accounts Receivable"
          />
          <input
            type="number"
            id="accounts_payable"
            name="accounts_payable"
            value={allValues.accounts_payable}
            onChange={changeHandler}
            placeholder="Accounts Payable"
          />
          <input
            type="number"
            id="canada_stock"
            name="canada_stock"
            value={allValues.canada_stock}
            onChange={changeHandler}
            placeholder="Canada Stocks"
          />
          <input
            type="number"
            id="us_stock"
            name="us_stock"
            value={allValues.us_stock}
            onChange={changeHandler}
            placeholder="US Stocks"
          />
          <button type="submit">Add</button>
        </form>
      </div>
    </Fragment>
  );
};

export default Input;
