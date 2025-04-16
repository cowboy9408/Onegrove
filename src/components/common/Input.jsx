import { EyeIcon, Info } from "lucide-react";
import { forwardRef, useState } from "react";
import { EyeOffIcon } from "../ui/eye-off";
import { XIcon } from "../ui/x";

const Input = forwardRef(function Input(
  {
    id,
    label,
    type = "text",
    placeholder = " ",
    maxLength,
    info,
    showDefaultInfo = false,
    required = false,
    disabled = false,
    className = "",
    value,
    onChange,
    onClear,
    error,
    topLabel = true,
    ...rest
  },
  ref
) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword && showPassword ? "text" : type;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full">
      {topLabel && label && (
        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className={`relative w-full ${className}`}>
        <input
          id={id}
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`peer w-full rounded-md border px-4 py-3 pr-10 text-sm placeholder-transparent focus:outline-none ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800"} ${rest?.readOnly ? "cursor-default bg-gray-100 text-gray-500 focus:border-gray-300 focus:ring-0" : ""} `}
          {...rest}
        />
        {!rest.readOnly && (
          <label
            htmlFor={id}
            className={`absolute -top-2 left-3 bg-white px-1 text-xs text-gray-300 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-800 dark:bg-transparent dark:text-gray-100 dark:peer-placeholder-shown:text-gray-500 dark:peer-focus:text-gray-100 ${rest?.readOnly ? "" : ""}`}
          >
            {label}
          </label>
        )}
        {/* 버튼 영역 */}
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
          {isPassword && value && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-black dark:hover:text-white"
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          )}
          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-400 hover:text-black dark:hover:text-white"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>
      {showDefaultInfo && maxLength && (
        <span className="mt-1 flex items-center gap-1 pl-1 text-xs text-gray-400">
          <Info size={14} />
          최대 {maxLength}자까지 입력 가능
        </span>
      )}
      {info && (
        <span className="mt-1 flex items-center gap-1 pl-1 text-xs text-gray-400">
          <Info size={14} />
          {info}
        </span>
      )}
      {error && (
        <span className="mt-1 flex items-center gap-1 pl-1 text-xs text-red-500">
          <Info size={14} />
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
