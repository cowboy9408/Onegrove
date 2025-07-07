import { useNavigate } from "react-router-dom";

export default function DataTableSimple({
  columns = [],
  data = [],
  link = {},
}) {
  const navigate = useNavigate();

  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-900 dark:text-gray-400">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border-r border-gray-200 px-4 py-3 last:border-r-0 dark:border-gray-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-800 dark:text-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
              >
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className={`${link.base && "cursor-pointer"} hover:bg-gray-50 dark:hover:bg-gray-900`}
                onClick={() => {
                  if (link && link.base && link.path) {
                    navigate(`${link.base}/${row[link.path]}`);
                  }
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="max-w-[30vw] overflow-hidden border-r border-gray-100 px-4 py-2 whitespace-nowrap last:border-r-0 dark:border-gray-800"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
