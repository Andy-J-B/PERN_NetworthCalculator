// ---------------------------------------------------------------
// client/src/config/fields.js – single source of truth for the
// money fields, their labels, and how a net-worth total is derived.
// Shared by the Add form (Input) and the Edit modal (Edit) so the
// two can never drift apart again.
// ---------------------------------------------------------------

export const ASSET_FIELDS = [
  {
    name: "cash_on_hand",
    label: "Cash on hand",
    hint: "Physical cash, wallets",
  },
  { name: "cash_in_bank", label: "Cash in bank", hint: "Chequing & savings" },
  {
    name: "accounts_receivable",
    label: "Accounts receivable",
    hint: "Money owed to you",
  },
  { name: "canada_stock", label: "Canada stocks", hint: "CAD holdings" },
  { name: "us_stock", label: "US stocks", hint: "USD holdings" },
];

export const LIABILITY_FIELDS = [
  {
    name: "accounts_payable",
    label: "Accounts payable",
    hint: "Money you owe",
  },
];

export const ALL_FIELDS = [...ASSET_FIELDS, ...LIABILITY_FIELDS];

export const FIELD_LABELS = ALL_FIELDS.reduce((acc, f) => {
  acc[f.name] = f.label;
  return acc;
}, {});

/** Coerce anything coming from the DB/form into a finite number. */
export const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Net worth = sum(assets) - sum(liabilities).
 * Mirrors the formula used by the API and the chart.
 */
export const computeTotal = (values) =>
  ASSET_FIELDS.reduce((sum, f) => sum + num(values?.[f.name]), 0) -
  LIABILITY_FIELDS.reduce((sum, f) => sum + num(values?.[f.name]), 0);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** "$1,234.56" – or an em dash when there is nothing to show. */
export const formatMoney = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  return currency.format(num(v));
};

/** Compact form for tight spaces: "$1.2k", "$3.4M". */
export const formatMoneyCompact = (v) => {
  const n = num(v);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${currencyWhole.format(
    abs / 1_000_000
  )}M`;
  if (abs >= 1000) return `${n < 0 ? "-" : ""}$${currencyWhole.format(
    abs / 1000
  )}k`;
  return currencyWhole.format(n);
};

/** "+$1,200.00" / "-$300.00" / "$0.00" */
export const formatSignedMoney = (v) => {
  const n = num(v);
  if (n === 0) return currencyWhole.format(0);
  return `${n > 0 ? "+" : "-"}${currency.format(Math.abs(n))}`;
};

/**
 * Keep the field as a raw string while typing so partial input like
 * "12." or "-" is not destroyed mid-keystroke. Returns "" for
 * anything that is not a plausible decimal number.
 */
export const sanitizeNumericInput = (raw) => {
  const s = String(raw ?? "");

  // Allow the transient states a user passes through while typing
  if (s === "" || s === "-" || s === "." || s === "-.") return s;

  if (/^-?\d*\.?\d*$/.test(s)) return s;

  // Recover a valid prefix from messy input such as a pasted "1.2.3"
  const cleaned = s.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot);
  const frac = cleaned.slice(dot + 1).replace(/\./g, "");
  return frac ? `${whole}.${frac}` : whole;
};