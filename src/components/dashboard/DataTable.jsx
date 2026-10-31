import EmptyState from "../common/EmptyState.jsx";
import { TableSkeleton } from "../common/LoadingState.jsx";

export default function DataTable({
  columns,
  data,
  keyField = "id",
  loading = false,
  emptyTitle = "No records found",
  emptyDescription,
  className = "",
}) {
  if (loading) return <TableSkeleton rows={5} />;

  if (!data?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-border bg-white ${className}`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-bg">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${col.headerClassName || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]} className="border-b border-border last:border-b-0 hover:bg-bg/60">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 align-middle text-text ${col.className || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
