interface DataTableProps {
  caption: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  firstColumnIsHeader?: boolean;
  compact?: boolean;
}

export function DataTable({
  caption,
  columns,
  rows,
  firstColumnIsHeader = false,
  compact = false,
}: DataTableProps) {
  return (
    <div className="data-table-wrap">
      <table className={`data-table${compact ? ' data-table--compact' : ''}`}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${caption}-${rowIndex}`}>
              {row.map((cell, cellIndex) =>
                firstColumnIsHeader && cellIndex === 0 ? (
                  <th key={`${cell}-${cellIndex}`} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={`${cell}-${cellIndex}`}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
