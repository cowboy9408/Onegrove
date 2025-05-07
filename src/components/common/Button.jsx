export default function Button({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
  variant = "default", // 👈 추가
}) {
  const baseClass = "cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:bg-gray-300";

  const variants = {
    default: "bg-black text-white hover:bg-gray-800 border border-black",
white: "bg-white text-black hover:bg-gray-100 border border-gray-300",
    outline: "border border-black text-black bg-transparent hover:bg-gray-100",
    // 필요시 더 추가 가능
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${className} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
