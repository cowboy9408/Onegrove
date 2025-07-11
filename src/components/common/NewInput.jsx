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
      <div className={`flex w-full items-center gap-2 ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="w-[60px] text-sm font-medium whitespace-nowrap text-gray-800"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex-1">
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
            className={`peer w-full rounded border px-3 py-2 text-sm ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-black"
            } ${disabled || rest.readOnly ? "bg-gray-100 text-gray-500" : ""}`}
            {...rest}
          />
          {/* 아이콘 영역 유지 */}
          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
            {isPassword && value && (
              <button type="button" onClick={togglePasswordVisibility}>
                👁
              </button>
            )}
            {value && onClear && (
              <button type="button" onClick={onClear}>
                ❌
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
