export default function Col({ children, className = "" }) {
  return <div className={`min-w-[200px] flex-1 ${className}`}>{children}</div>;
}
