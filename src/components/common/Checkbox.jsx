export default function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black disabled:cursor-not-allowed"
      />
      {label}
    </label>
  );
}
