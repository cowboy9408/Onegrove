import { EyeIcon, Info } from "lucide-react";
import { forwardRef, useState } from "react";
import { EyeOffIcon } from "../ui/eye-off";
import { XIcon } from "../ui/x";

const NewInput = forwardRef(function NewInput(
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
    height = "h-7",
    width = "w-full",
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
    <div className={`${className}`}>
      <div className="flex items-center gap-2 relative">
        {label && (
          <label
            htmlFor={id}
            className="min-w-[100px] text-sm font-medium text-gray-800 dark:text-gray-100"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className={`relative ${width}`}>
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
            className={`peer w-full border px-4 pr-10 text-sm focus:outline-none focus:ring-2
              ${height} rounded-none
              ${error ? "border-red-500 focus:ring-red-500" : "border-black focus:ring-black"}
              ${rest?.readOnly ? "cursor-default bg-gray-100 text-gray-500" : ""}
            `}
            {...rest}
          />
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
      </div>

      {showDefaultInfo && maxLength && (
        <span className="mt-1 flex items-center gap-1 pl-[100px] text-xs text-gray-400">
          <Info size={14} />
          최대 {maxLength}자까지 입력 가능
        </span>
      )}
      {info && (
        <span className="mt-1 flex items-center gap-1 pl-[100px] text-xs text-gray-400">
          <Info size={14} />
          {info}
        </span>
      )}
      {error && (
        <span className="mt-1 flex items-center gap-1 pl-[100px] text-xs text-red-500">
          <Info size={14} />
          {error}
        </span>
      )}
    </div>
  );
});

export default NewInput;
