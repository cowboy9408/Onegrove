export default function Box({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
