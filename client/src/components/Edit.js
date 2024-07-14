import React, { Fragment, useState } from "react";

const Editnetworth = ({ networth }) => {
  const [today_date, set_today_date] = useState(networth.today_date);
  const [cash_on_hand, set_cash_on_hand] = useState(
    parseFloat(networth.cash_on_hand)
  );
  const [cash_in_bank, set_cash_in_bank] = useState(
    parseFloat(networth.cash_in_bank)
  );
  const [accounts_receivable, set_accounts_receivable] = useState(
    parseFloat(networth.accounts_receivable)
  );
  const [accounts_payable, set_accounts_payable] = useState(
    parseFloat(networth.accounts_payable)
  );
  const [canada_stock, set_canada_stock] = useState(
    parseFloat(networth.canada_stock)
  );
  const [us_stock, set_us_stock] = useState(parseFloat(networth.us_stock));

  // Edit description function

  const updateDescription = async (e) => {
    e.preventDefault();
    try {
      const body = {
        today_date,
        cash_on_hand,
        cash_in_bank,
        accounts_receivable,
        accounts_payable,
        canada_stock,
        us_stock,
      };

      let finalBody = {};
      for (var key in body) {
        finalBody[key] = parseFloat(body[key]);
      }
      const sumValues = (obj) =>
        Object.values(obj).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);

      let nontoday = Object.assign({}, finalBody);
      delete nontoday["today_date"];
      delete nontoday["accounts_payable"];
      finalBody["today_date"] = body["today_date"];
      finalBody["total_networth"] = (
        sumValues(nontoday) - parseFloat(finalBody["accounts_payable"])
      ).toFixed(2);

      const response = await fetch(
        `http://localhost:4000/networth_calculator/${networth.networth_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalBody),
        }
      );

      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  const setAllValues = () => {
    set_today_date(networth.today_date);
    set_cash_on_hand(networth.cash_on_hand);
    set_cash_in_bank(networth.cash_in_bank);
    set_accounts_receivable(networth.accounts_receivable);
    set_accounts_payable(networth.accounts_payable);
    set_canada_stock(networth.canada_stock);
    set_us_stock(networth.us_stock);
  };

  return (
    <Fragment>
      <button
        type="button"
        className="btn btn-warning"
        data-toggle="modal"
        data-target={`#id${networth.networth_id}`}
      >
        Edit
      </button>
      {/*
        id = id10
         */}
      <div
        className="modal"
        id={`id${networth.networth_id}`}
        onClick={setAllValues}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit networth</h4>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                onClick={setAllValues}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <input
                type="datetime"
                className="form-control"
                value={today_date}
                onChange={(e) => set_today_date(e.target.value)}
              ></input>
              <input
                type="number"
                className="form-control"
                value={cash_on_hand}
                onChange={(e) => set_cash_on_hand(e.target.value)}
              ></input>
              <input
                type="number"
                className="form-control"
                value={cash_in_bank}
                onChange={(e) => set_cash_in_bank(e.target.value)}
              ></input>
              <input
                type="number"
                className="form-control"
                value={accounts_receivable}
                onChange={(e) => set_accounts_receivable(e.target.value)}
              ></input>
              <input
                type="number"
                className="form-control"
                value={accounts_payable}
                onChange={(e) => set_accounts_payable(e.target.value)}
              ></input>
              <input
                type="number"
                className="form-control"
                value={canada_stock}
                onChange={(e) => set_canada_stock(e.target.value)}
              ></input>
              <input
                type="number"
                className="form-control"
                value={us_stock}
                onChange={(e) => set_us_stock(e.target.value)}
              ></input>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-warning"
                data-dismiss="modal"
                onClick={(e) => updateDescription(e)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                onClick={setAllValues}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Editnetworth;
