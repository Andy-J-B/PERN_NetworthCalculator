// client/src/App.js
import React, { useState, useEffect, createContext } from "react";
import Input from "./components/Input";
import List from "./components/List";
import "./App.css";

/* --------------------------------------------------------------
   Context – exported once so any component can import it
   -------------------------------------------------------------- */
export const NetWorthContext = createContext();

/* --------------------------------------------------------------
   Main App component
   -------------------------------------------------------------- */
function App() {
  // --------------------------------------------------------------
  // State that lives in the top‑level and is shared via context
  // --------------------------------------------------------------
  const [networths, setNetworths] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL for the API – can be overridden with REACT_APP_API_URL
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:2938";

  // -----------------------------------------------------------------
  // Debug: this fires every time the component (re)renders
  // -----------------------------------------------------------------
  console.log("%c<App> rendered", "color:#3b82f6;font-weight:bold");

  // -----------------------------------------------------------------
  // Load **all** rows once – runs again only if the API base URL changes
  // -----------------------------------------------------------------
  useEffect(() => {
    // encapsulate the async work so we can keep the dependency array tiny
    const fetchAll = async () => {
      console.log("%cfetchAll – start", "color:#10b981");
      try {
        const resp = await fetch(`${apiBase}/networth_calculator`);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        console.log("%cfetchAll – data received:", "color:#10b981", data);
        setNetworths(data);
      } catch (err) {
        console.error("%cfetchAll – error:", "color:#ef4444", err);
      } finally {
        setLoading(false);
        console.log("%cfetchAll – finished (loading → false)", "color:#10b981");
      }
    };

    fetchAll();
  }, [apiBase]); // <- only runs when the base URL changes

  // -----------------------------------------------------------------
  // Helper functions that child components will call
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

  // -----------------------------------------------------------------
  // Optional manual refresh (e.g. a “Refresh” button somewhere)
  // -----------------------------------------------------------------
  const refresh = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${apiBase}/networth_calculator`);
      const data = await resp.json();
      console.log("%crefresh – new data:", "color:#3b82f6", data);
      setNetworths(data);
    } catch (e) {
      console.error("%crefresh – error:", "color:#ef4444", e);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Provide everything via context – no prop‑drilling needed
  // -----------------------------------------------------------------
  return (
    <NetWorthContext.Provider
      value={{
        networths,
        loading,
        addNetWorth,
        deleteNetWorth,
        updateNetWorth,
        refresh,
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
