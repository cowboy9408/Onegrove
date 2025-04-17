import { useNavigate } from "react-router-dom";

export default function DataTable({
  columns = [],
  data = [],
  link = {},
  checkable = false,
  checkedIds = [],
  onCheck = () => {},
}) {
  const navigate = useNavigate();

  const allChecked =
    data.length > 0 && data.every((row) => checkedIds.includes(row._id));
  const handleAllCheck = (e) => {
    data.forEach((row) => onCheck(row._id, e.target.checked));
  };

  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-900 dark:text-gray-400">
          <tr>
            {checkable && (
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllCheck}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-800 dark:text-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (checkable ? 1 : 0)}
                className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
              >
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const isChecked = checkedIds.includes(row._id);
              return (
                <tr
                  key={idx}
                  className={`${(checkable || link.base) && "cursor-pointer"} hover:bg-gray-50 dark:hover:bg-gray-900`}
                  onClick={() => {
                    if (!checkable && link) {
                      navigate(
                        `${link.base}/${row[link.path]}${link.params ? "?" + link.params : ""}`
                      );
                    } else if (checkable) {
                      onCheck(row._id, !isChecked);
                    }
                  }}
                >
                  {checkable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onCheck(row._id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
