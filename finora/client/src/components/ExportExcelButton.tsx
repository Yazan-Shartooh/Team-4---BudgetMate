import { useState } from "react";
import { Download } from "lucide-react";
import ErrorMessage from "./ErrorMessage";
import {
  createExportWorkbook,
  downloadExcelWorkbook,
} from "../utils/excelWorkbook";
import type { ExcelWorkbookData } from "../utils/excelWorkbook";

export type ExportExcelButtonProps = ExcelWorkbookData & {
  label?: string;
  disabled?: boolean;
};

export default function ExportExcelButton(props: ExportExcelButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label =
    props.label ?? (props.kind === "report" ? "Export report" : "Export");

  async function handleExport() {
    if (pending || props.disabled) return;
    setPending(true);
    setError(null);
    try {
      const workbook = createExportWorkbook(props);
      downloadExcelWorkbook(workbook, props.fileName);
    } catch {
      setError("The Excel workbook could not be created. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="export-excel-control">
      <button
        type="button"
        className="button button--secondary"
        disabled={pending || props.disabled}
        aria-busy={pending}
        onClick={() => void handleExport()}
      >
        <Download size={16} aria-hidden="true" />
        {pending ? "Preparing workbook…" : label}
      </button>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
