import React, { Fragment, useState } from "react";

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
        "http://localhost:4000/networth_calculator",
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
      <h1 className="text-center mt-5">Networth Calculator</h1>

      <form className="d-flex mt-5" onSubmit={onSubmitForm}>
        <input
          type="number"
          id="cash_on_hand"
          name="cash_on_hand"
          className="form-control"
          value={allValues.cash_on_hand}
          onChange={changeHandler}
          placeholder="Cash On Hand"
        ></input>
        <input
          type="number"
          id="cash_in_bank"
          name="cash_in_bank"
          className="form-control"
          value={allValues.cash_in_bank}
          onChange={changeHandler}
          placeholder="Cash In Bank"
        ></input>
        <input
          type="number"
          id="accounts_receivable"
          name="accounts_receivable"
          className="form-control"
          value={allValues.accounts_receivable}
          onChange={changeHandler}
          placeholder="Accounts Receivable"
        ></input>
        <input
          type="number"
          id="accounts_payable"
          name="accounts_payable"
          className="form-control"
          value={allValues.accounts_payable}
          onChange={changeHandler}
          placeholder="Accounts Payable"
        ></input>
        <input
          type="number"
          id="canada_stock"
          name="canada_stock"
          className="form-control"
          value={allValues.canada_stock}
          onChange={changeHandler}
          placeholder="Canada Stocks"
        ></input>
        <input
          type="number"
          id="us_stock"
          name="us_stock"
          className="form-control"
          value={allValues.us_stock}
          onChange={changeHandler}
          placeholder="US Stocks"
        ></input>
        <button className="btn btn-success">Add</button>
      </form>
    </Fragment>
  );
};

export default Input;
