// ---------------------------------------------------------------
// client/src/components/MoneyField.js – a labelled currency input.
// Deliberately type="text" + inputMode="decimal": type="number"
// blocks drag-to-select and shows spinners, which is exactly the
// interaction that made the old modal feel broken.
// ---------------------------------------------------------------

import React from "react";
import "../css/Fields.css";

const MoneyField = ({
  field,
  value,
  onChange,
  idPrefix,
  negative = false,
  autoFocus = false,
}) => {
  const id = `${idPrefix}-${field.name}`;
  const hintId = `${id}-hint`;

  return (
    <div className={`money-field${negative ? " is-negative" : ""}`}>
      <label className="money-field-label" htmlFor={id}>
        {field.label}
      </label>

      <div className="money-field-control">
        <span className="money-field-prefix" aria-hidden="true">
          {negative ? "−$" : "$"}
        </span>
        <input
          id={id}
          name={field.name}
          className="money-field-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={value}
          aria-describedby={hintId}
          onChange={(e) => onChange(field.name, e.target.value)}
          autoFocus={autoFocus}
        />
      </div>

      <p className="money-field-hint" id={hintId}>
        {field.hint}
      </p>
    </div>
  );
};

export default MoneyField;