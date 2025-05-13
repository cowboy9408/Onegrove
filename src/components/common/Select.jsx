import { useState } from "react";
import { ArrowDownIcon } from "../ui/arrow-down";
import { ArrowUpIcon } from "../ui/arrow-up";

export default function Select({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  children,
  className = "",
  topLabel = true,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {topLabel && label && (
        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className={`relative w-full ${className}`}>
        <select
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className="peer w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-transparent focus:ring-2 focus:ring-gray-800 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-gray-600 dark:disabled:bg-gray-800"
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className="pointer-events-none absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-300 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-800 dark:bg-transparent dark:text-gray-100 dark:peer-placeholder-shown:text-gray-500 dark:peer-focus:text-gray-100"
        >
          {label}
        </label>
        <div className="pointer-events-none absolute top-1/3 right-4 -translate-y-1/2 text-gray-400 dark:text-gray-300">
          <div className="relative h-5 w-5">
            <div
              className={`absolute transition-all duration-300 ${
                isFocused
                  ? "rotate-0 transform opacity-100"
                  : "rotate-180 transform opacity-0"
              }`}
            >
              <ArrowUpIcon size={18} />
            </div>
            <div
              className={`absolute transition-all duration-300 ${
                !isFocused
                  ? "rotate-0 transform opacity-100"
                  : "rotate-180 transform opacity-0"
              }`}
            >
              <ArrowDownIcon size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
