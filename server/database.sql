CREATE DATABASE pernNC;

CREATE TABLE networth (
    networth_id SERIAL PRIMARY KEY,
    today_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cash_on_hand DECIMAL,
    cash_in_bank DECIMAL,
    accounts_receivable DECIMAL,
    accounts_payable DECIMAL,
    canada_stock DECIMAL,
    us_stock DECIMAL,
    total_networth DECIMAL
);

