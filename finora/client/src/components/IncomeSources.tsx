import { useId } from "react";
import type { CategoryTotal, IncomeCategory } from "../types";

export interface IncomeSourcesProps {
  rows: readonly CategoryTotal<IncomeCategory>[];
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function IncomeSources({ rows }: IncomeSourcesProps) {
  const id = useId();
  return (
    <section className="income-sources card" aria-labelledby={`${id}-title`}>
      <div className="card-heading">
        <h2 id={`${id}-title`}>Income sources</h2>
      </div>
      <ul className="dashboard-spending-list">
        {rows.map((row) => (
          <li className="income-source" key={row.category}>
            <span>{row.category}</span>
            <span>
              {money.format(row.amount)} · {row.percentage.toFixed(1)}%
            </span>
            <progress
              className="progress"
              max={100}
              value={Math.min(100, Math.max(0, row.percentage))}
              aria-label={`${row.category} income share: ${row.percentage.toFixed(1)}%`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
