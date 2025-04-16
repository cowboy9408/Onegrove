import { Info } from "lucide-react";
import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    id,
    name,
    label,
    value,
    onChange,
    maxLength,
    required = false,
    disabled = false,
    placeholder = "",
    showDefaultInfo = true,
    error,
    className = "",
    ...rest
  },
  ref
) {
  const isError = !!error;
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between pb-2 pl-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-800 dark:text-gray-100"
        >
          {label}
          {required && <span className="ml-1 text-xs text-red-500">*</span>}
        </label>
      </div>
      <div className={`relative w-full ${className}`}>
        <textarea
          id={id}
          name={name}
          ref={ref}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={5}
          className={`peer w-full resize-none rounded-md border px-4 py-3 text-sm transition-all focus:ring-2 focus:outline-none ${
            isError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-gray-800"
          } disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800`}
          {...rest}
        />
        {showDefaultInfo && maxLength && (
          <span className="flex items-center gap-1 pt-1 pl-1 text-xs text-gray-400">
            <Info size={14} />
            최대 {maxLength}자까지 입력 가능
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1 pt-1 pl-1 text-xs text-red-500">
            <Info size={14} />
            {error}
          </span>
        )}
      </div>
    </div>
  );
});

export default Textarea;
