import { useId, useState } from "react";
import type { ComponentType } from "react";
import type {
  ApiError,
  CategoryTotal,
  IncomeCategory,
  MonthFilterProps,
  RequestStatus,
  Transaction,
  TransactionFilters as Filters,
  TransactionInput,
} from "../types";
import {
  NotificationProvider,
  useNotifications,
} from "../context/NotificationContext";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import TransactionForm from "./TransactionForm";
import DeleteTransactionModal from "./DeleteTransactionModal";
import Modal from "./Modal";
import LoadingMessage from "./LoadingMessage";
import ErrorMessage from "./ErrorMessage";
import IncomeSources from "./IncomeSources";
import ExportExcelButton from "./ExportExcelButton";

export interface IncomeSectionProps {
  transactions: readonly Transaction[];
  sources: readonly CategoryTotal<IncomeCategory>[];
  total: number;
  totalIncomeCount: number;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  status: RequestStatus;
  error: ApiError | null;
  pending: boolean;
  mutationError: ApiError | null;
  onRetry: () => void;
  onCreate: (input: TransactionInput) => Promise<void>;
  onUpdate: (
    transaction: Transaction,
    input: TransactionInput,
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClearMutation: () => void;
  MonthFilterComponent?: ComponentType<MonthFilterProps>;
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function IncomeContent(props: IncomeSectionProps) {
  const id = useId();
  const [editing, setEditing] = useState<Transaction | "new" | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotifications();
  const busy = props.pending || submitting;
  const unavailable = props.status !== "succeeded" || busy;
  const close = () => {
    if (!busy) {
      setEditing(null);
      setDeleting(null);
      props.onClearMutation();
    }
  };

  return (
    <section className="income-section page-stack" aria-label="Income">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Every payday, project, and little extra</p>
          <h1>Income</h1>
          <p>Track earnings by source and month.</p>
        </div>
        <div className="page-heading-actions">
          <ExportExcelButton
            kind="records"
            rows={props.transactions}
            fileName={`finora-income-${props.filters.month || "all"}.xlsx`}
            label="Export income"
            disabled={unavailable}
          />
          <button
            type="button"
            className="button button--primary"
            disabled={unavailable}
            onClick={() => {
              props.onClearMutation();
              setEditing("new");
            }}
          >
            Add income
          </button>
        </div>
      </div>
      {props.status === "idle" && (
        <div className="feedback">
          <p>Income data have not loaded yet.</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={props.onRetry}
          >
            Load income
          </button>
        </div>
      )}
      {props.status === "pending" && (
        <LoadingMessage message="Loading income…" />
      )}
      {props.status === "failed" && (
        <ErrorMessage
          message={props.error?.message ?? "Unable to load income."}
          onRetry={props.onRetry}
          pending={busy}
        />
      )}
      {props.status === "failed" && props.totalIncomeCount > 0 && (
        <p className="feedback">
          Showing previously loaded income. Reload before making changes.
        </p>
      )}
      {(props.status === "succeeded" || props.totalIncomeCount > 0) && (
        <>
          <div className="income-overview">
            <section
              className="income-total"
              aria-label="Filtered income total"
            >
              <p className="income-caption">Income in selected period</p>
              <p className="amount">{money.format(props.total)}</p>
              <p className="text-muted">Based on the current income filters</p>
            </section>
            <IncomeSources rows={props.sources} />
          </div>
          <section
            className="card income-history"
            aria-busy={busy}
            aria-labelledby={`${id}-history`}
          >
            <div className="card-heading">
              <h2 id={`${id}-history`}>Income history</h2>
              <span className="transactions-count">
                {props.transactions.length} entries
              </span>
            </div>
            <TransactionFilters
              value={props.filters}
              onChange={props.onFiltersChange}
              lockedType="income"
              disabled={busy}
              MonthFilterComponent={props.MonthFilterComponent}
            />
            <TransactionTable
              transactions={props.transactions}
              caption="Income history, newest first"
              pending={unavailable}
              emptyTitle={
                props.totalIncomeCount ? "No income matches" : "No income yet"
              }
              emptyDescription={
                props.totalIncomeCount
                  ? "Try another month or clear your filters."
                  : "Add your first income entry to start tracking."
              }
              readOnly={false}
              onEdit={(transaction) => {
                props.onClearMutation();
                setEditing(transaction);
              }}
              onDelete={(transaction) => {
                props.onClearMutation();
                setDeleting(transaction);
              }}
            />
            <div className="transactions-footer">
              <p>{props.transactions.length} matching income entries</p>
              <p>All amounts in USD</p>
            </div>
          </section>
        </>
      )}
      <Modal
        open={editing !== null}
        title={editing === "new" ? "Add income" : "Edit income"}
        onClose={close}
        pending={busy}
      >
        {editing && (
          <TransactionForm
            transaction={editing === "new" ? undefined : editing}
            initialType="income"
            lockedType="income"
            pending={busy}
            error={props.mutationError}
            onCancel={close}
            onSubmit={async (input) => {
              setSubmitting(true);
              try {
                if (editing === "new") await props.onCreate(input);
                else await props.onUpdate(editing, input);
                setEditing(null);
                notify({
                  kind: "success",
                  message:
                    editing === "new" ? "Income added." : "Income updated.",
                });
              } finally {
                setSubmitting(false);
              }
            }}
          />
        )}
      </Modal>
      <DeleteTransactionModal
        transaction={deleting}
        pending={busy}
        error={props.mutationError}
        onClose={close}
        onConfirm={async (transactionId) => {
          setSubmitting(true);
          try {
            await props.onDelete(transactionId);
            setDeleting(null);
            notify({ kind: "success", message: "Income deleted." });
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </section>
  );
}

export default function IncomeSection(props: IncomeSectionProps) {
  return (
    <NotificationProvider>
      <IncomeContent {...props} />
    </NotificationProvider>
  );
}
