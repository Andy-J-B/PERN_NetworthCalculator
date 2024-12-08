import React, { Fragment, useEffect, useState } from "react";
import Edit from "./Edit.js";
import "../css/List.css";
import NetWorthGraph from "./Graph.js";

const List = () => {
  const [networths, setNetworths] = useState([]);

  // delete networth function

  const formatDate = (date) => {
    const civicNumber = date.substr(0, date.indexOf("T"));
    return civicNumber;
  };

  const deleteNW = async (id) => {
    try {
      const deleteNW = await fetch(
        `http://localhost:4000/networth_calculator/${id}`,
        {
          method: "DELETE",
        }
      );

      // Make it refresh page

      setNetworths(networths.filter((networth) => networth.networth_id !== id)); // filters networths
    } catch (err) {
      console.error(err.message);
    }
  };

  const getNWs = async () => {
    try {
      const response = await fetch("http://localhost:4000/networth_calculator");
      const jsonData = await response.json();

      setNetworths(jsonData);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getNWs();
  }, []);

  return (
    <Fragment>
      {" "}
      <table className="table mt-5 text-center">
        <thead>
          <tr>
            <th>Date of Input</th>
            <th>Cash On Hand</th>
            <th>Cash In Bank</th>
            <th>Accounts Receivable</th>
            <th>Accounts Payable</th>
            <th>Canadian Stocks</th>
            <th>US Stocks</th>
            <th>Total Networth</th>

            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {networths.map((networth) => (
            <tr key={networth.networth_id}>
              <td>{formatDate(networth.today_date)}</td>
              <td>{networth.cash_on_hand}</td>
              <td>{networth.cash_in_bank}</td>
              <td>{networth.accounts_receivable}</td>
              <td>{networth.accounts_payable}</td>
              <td>{networth.canada_stock}</td>
              <td>{networth.us_stock}</td>
              <td>{networth.total_networth}</td>
              <td>
                <Edit networth={networth} />
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteNW(networth.networth_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="graph-container mt-5">
        <NetWorthGraph networths={networths} />
      </div>
    </Fragment>
  );
};

export default List;
