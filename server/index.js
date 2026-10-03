require("dotenv").config(); // load .env (optional)

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();

// ------------------------------------------------------
// Middleware
// ------------------------------------------------------
app.use(express.json()); // needed for JSON bodies
app.use(express.urlencoded({ extended: true })); // optional – for form bodies
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  }),
);

// ------------------------------------------------------
// Helper utilities
// ------------------------------------------------------
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const toNumber = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

// ------------------------------------------------------
// POST – create a snapshot
// ------------------------------------------------------
app.post(
  "/networth_calculator",
  asyncHandler(async (req, res) => {
    console.log("POST payload:", req.body);

    const {
      cash_on_hand = 0,
      cash_in_bank = 0,
      accounts_receivable = 0,
      accounts_payable = 0,
      canada_stock = 0,
      us_stock = 0,
      total_networth,
    } = req.body;

    if (total_networth == null) {
      return res.status(400).json({ error: "total_networth is required" });
    }

    const payload = {
      cash_on_hand: toNumber(cash_on_hand),
      cash_in_bank: toNumber(cash_in_bank),
      accounts_receivable: toNumber(accounts_receivable),
      accounts_payable: toNumber(accounts_payable),
      canada_stock: toNumber(canada_stock),
      us_stock: toNumber(us_stock),
      total_networth: parseFloat(total_networth),
    };

    const sql = `
  INSERT INTO networth
    (cash_on_hand, cash_in_bank, accounts_receivable, accounts_payable,
     canada_stock, us_stock, total_networth)
  VALUES ($1,$2,$3,$4,$5,$6,$7)
  RETURNING *
`;

    const values = [
      payload.cash_on_hand,
      payload.cash_in_bank,
      payload.accounts_receivable,
      payload.accounts_payable,
      payload.canada_stock,
      payload.us_stock,
      payload.total_networth,
    ];

    const { rows } = await pool.query(sql, values);
    res.status(201).json(rows[0]);
  }),
);

// ------------------------------------------------------
// GET – list all snapshots
// ------------------------------------------------------
app.get(
  "/networth_calculator",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      "SELECT * FROM networth ORDER BY today_date ASC, networth_id ASC",
    );
    res.json(rows);
  }),
);

// ------------------------------------------------------
// GET – one snapshot by id
// ------------------------------------------------------
app.get(
  "/networth_calculator/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM networth WHERE networth_id = $1",
      [id],
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  }),
);

// ------------------------------------------------------
// PUT – update a snapshot
// ------------------------------------------------------
app.put(
  "/networth_calculator/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      today_date,
      cash_on_hand,
      cash_in_bank,
      accounts_receivable,
      accounts_payable,
      canada_stock,
      us_stock,
      total_networth,
    } = req.body;

    if (total_networth == null) {
      return res.status(400).json({ error: "total_networth is required" });
    }

    const sql = `
      UPDATE networth
      SET today_date = COALESCE($1, today_date),
          cash_on_hand = $2,
          cash_in_bank = $3,
          accounts_receivable = $4,
          accounts_payable = $5,
          canada_stock = $6,
          us_stock = $7,
          total_networth = $8
      WHERE networth_id = $9
      RETURNING *
    `;
    const values = [
      today_date,
      toNumber(cash_on_hand),
      toNumber(cash_in_bank),
      toNumber(accounts_receivable),
      toNumber(accounts_payable),
      toNumber(canada_stock),
      toNumber(us_stock),
      parseFloat(total_networth),
      id,
    ];

    const { rows } = await pool.query(sql, values);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  }),
);

// ------------------------------------------------------
// DELETE – remove a snapshot
// ------------------------------------------------------
app.delete(
  "/networth_calculator/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM networth WHERE networth_id = $1",
      [id],
    );
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  }),
);

// ------------------------------------------------------
// Serve React app in production
// ------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "client", "build", "index.html"),
    );
  });
}

// ------------------------------------------------------
// Global error handler
// ------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error("⚡️ Unexpected error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------------------------------------
// Start server
// ------------------------------------------------------
const PORT = process.env.PORT || 2938;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on ${PORT}`);
});
