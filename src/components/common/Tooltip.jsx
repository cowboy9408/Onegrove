export default function Tooltip({ label, children, position = "top" }) {
  const positionClasses = {
    top: "-top-10 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
    left: "-left-[100%] mr-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div className="group relative inline-flex items-center justify-center">
      {children}

      {label && (
        <div
          className={`absolute z-50 max-w-xs scale-0 rounded bg-black px-3 py-2 text-xs text-white opacity-0 shadow transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 ${positionClasses[position]} whitespace-normal`}
        >
          {label}

          {position === "top" && (
            <div className="absolute top-full left-1/2 -ml-1 h-2 w-2 rotate-45 bg-black" />
          )}
        </div>
      )}
    </div>
  );
}
