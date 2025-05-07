// components/SelectInput.jsx

import { useState } from "react";
import { ArrowDownIcon } from "../ui/arrow-down";
import { ArrowUpIcon } from "../ui/arrow-up";
import { XIcon } from "../ui/x";

export default function SelectInput({
  label,
  selectOptions = [],
  selectValue,
  inputValue,
  onSelectChange,
  onInputChange,
  onClear,
  required = false,
  disabled = false,
  className = "",
  topLabel = true,
  error,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`w-full ${className}`}>
      {topLabel && label && (
        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500">*</span>}
        </p>
      )}

      <div className="flex w-full items-center gap-2">
        {/* 셀렉트 박스 */}
        <div className="relative w-1/3">
          <select
            value={selectValue}
            onChange={onSelectChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className="peer w-full appearance-none rounded-md border px-4 py-3 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2
              border-black focus:border-black focus:ring-black
              disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800"
          >
            {selectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
            <div className="relative h-5 w-5">
              <div className={`absolute -bottom-2 translate-y duration-300 ${isFocused ? "opacity-100 rotate-0" : "opacity-0 rotate-180"}`}>
                <ArrowUpIcon size={18} />
              </div>
              <div className={`absolute -bottom-2 translate-y duration-300 ${!isFocused ? "opacity-100 rotate-0" : "opacity-0 rotate-180"}`}>
                <ArrowDownIcon size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* 인풋 박스 */}
        <div className="relative w-2/3">
          <input
            type="text"
            value={inputValue}
            onChange={onInputChange}
            disabled={disabled}
            className="w-full rounded-md border px-4 py-3 pr-8 text-sm text-gray-800
              border-black focus:border-black focus:ring-2 focus:ring-black
              disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800"
          />
          {inputValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <span className="mt-1 block pl-1 text-xs text-red-500">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
