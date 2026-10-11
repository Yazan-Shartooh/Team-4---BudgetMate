import { useState } from "react";

import {
  getTodayDate,
  validateIncomeAmount,
  validateIncomeDate,
} from "../utils/incomeValidation";

import "./IncomeForm.css";

function IncomeForm() {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const [amountError, setAmountError] = useState("");
  const [dateError, setDateError] = useState("");

  return (
    <form className="income-form" onSubmit={(event) => event.preventDefault()}>
      <div className="income-form__field">
        <label htmlFor="income-amount">Amount</label>

        <input
          id="income-amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setAmountError("");
          }}
          onBlur={() => {
            setAmountError(validateIncomeAmount(amount));
          }}
          aria-invalid={amountError !== ""}
          aria-describedby={amountError ? "income-amount-error" : undefined}
        />

        {amountError && (
          <p
            id="income-amount-error"
            className="income-form__error"
            role="alert"
          >
            {amountError}
          </p>
        )}
      </div>

      <div className="income-form__field">
        <label htmlFor="income-category">Category</label>

        <select
          id="income-category"
          name="categoryId"
          required
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
          }}
        >
          <option value="" disabled>
            Select an income category
          </option>
        </select>
      </div>

      <div className="income-form__field">
        <label htmlFor="income-date">Date</label>

        <input
          id="income-date"
          name="date"
          type="date"
          required
          max={getTodayDate()}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setDateError("");
          }}
          onBlur={() => {
            setDateError(validateIncomeDate(date));
          }}
          aria-invalid={dateError !== ""}
          aria-describedby={dateError ? "income-date-error" : undefined}
        />

        {dateError && (
          <p id="income-date-error" className="income-form__error" role="alert">
            {dateError}
          </p>
        )}
      </div>

      <div className="income-form__field">
        <label htmlFor="income-note">Note (optional)</label>

        <textarea
          id="income-note"
          name="note"
          rows={3}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
          }}
        />
      </div>

      <button className="income-form__submit" type="button" disabled>
        Save income
      </button>
    </form>
  );
}

export default IncomeForm;
