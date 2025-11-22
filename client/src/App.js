/* client/src/App.js */
import React, { useState, useEffect, createContext } from "react";
import Input from "./components/Input";
import List from "./components/List";
import "./App.css";

// Context so we don’t have to drill props through many components
export const NetWorthContext = createContext();

function App() {
  const [networths, setNetworths] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:2938";

  // -----------------------------------------------------------------
  // Load all rows once on mount
  // -----------------------------------------------------------------
  const fetchAll = async () => {
    try {
      const resp = await fetch(`${apiBase}/networth_calculator`);
      if (!resp.ok) throw new Error("Failed to fetch");
      const data = await resp.json();
      setNetworths(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // -----------------------------------------------------------------
  // Helpers that child components will call
  // -----------------------------------------------------------------
  const addNetWorth = (newRow) => setNetworths((s) => [...s, newRow]);
  const deleteNetWorth = (id) =>
    setNetworths((s) => s.filter((row) => row.networth_id !== id));
  const updateNetWorth = (updatedRow) =>
    setNetworths((s) =>
      s.map((row) =>
        row.networth_id === updatedRow.networth_id ? updatedRow : row
      )
    );

  return (
    <NetWorthContext.Provider
      value={{
        networths,
        loading,
        addNetWorth,
        deleteNetWorth,
        updateNetWorth,
        refresh: fetchAll,
        apiBase,
      }}
    >
      <div className="container">
        <h1 className="app-title">📈 Net Worth Tracker</h1>
        <Input />
        <List />
      </div>
    </NetWorthContext.Provider>
  );
}

export default App;
