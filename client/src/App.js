// client/src/App.js
import React, { useState, useEffect, createContext } from "react";
import Input from "./components/Input";
import List from "./components/List";
import "./App.css";

/* --------------------------------------------------------------
   Context – exported once so any component can import it
   -------------------------------------------------------------- */
export const NetWorthContext = createContext();

function App() {
  const [networths, setNetworths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:2938";

  // -----------------------------------------------------------------
  // Load **all** rows once – runs again only if the API base URL changes
  // -----------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const resp = await fetch(`${apiBase}/networth_calculator`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!cancelled) setNetworths(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not reach the server");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  // -----------------------------------------------------------------
  // Mutations shared with children via context
  // -----------------------------------------------------------------
  const addNetWorth = (newRow) =>
    setNetworths((s) => [...s, newRow].sort(sortByDate));

  const deleteNetWorth = (id) =>
    setNetworths((s) => s.filter((row) => row.networth_id !== id));

  const updateNetWorth = (updatedRow) =>
    setNetworths((s) =>
      sortByDate(
        s.map((row) =>
          row.networth_id === updatedRow.networth_id ? updatedRow : row
        )
      )
    );

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${apiBase}/networth_calculator`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setNetworths(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NetWorthContext.Provider
      value={{
        networths,
        loading,
        error,
        addNetWorth,
        deleteNetWorth,
        updateNetWorth,
        refresh,
        apiBase,
      }}
    >
      <div className="container">
        <header className="app-header">
          <h1 className="app-title">📈 Net Worth Tracker</h1>
          <p className="app-subtitle">
            Record a snapshot any time to see how your net worth moves over
            time.
          </p>
        </header>

        {error && (
          <div className="app-error" role="alert">
            <span>Couldn't load your data — {error}.</span>
            <button className="btn btn-ghost" onClick={refresh}>
              Try again
            </button>
          </div>
        )}

        <Input />
        <List />
      </div>
    </NetWorthContext.Provider>
  );
}

/** Keep the table in chronological order after any local mutation. */
function sortByDate(rows) {
  return [...rows].sort((a, b) => {
    const d = new Date(a.today_date) - new Date(b.today_date);
    return Number.isNaN(d) ? 0 : d || a.networth_id - b.networth_id;
  });
}

export default App;