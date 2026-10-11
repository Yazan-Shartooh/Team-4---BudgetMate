export function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function validateIncomeAmount(value: string): string {
  const amount = value.trim();

  if (amount === "") {
    return "Amount is required.";
  }

  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return "Enter a positive amount with at most two decimal places.";
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Amount must be greater than zero.";
  }

  return "";
}

export function validateIncomeDate(value: string): string {
  if (value === "") {
    return "Date is required.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Enter a valid date.";
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    return "Enter a valid date.";
  }

  if (value > getTodayDate()) {
    return "Date cannot be in the future.";
  }

  return "";
}
