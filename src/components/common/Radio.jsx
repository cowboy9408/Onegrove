export default function Radio({ id, name, value, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-gray-300 text-black focus:ring-black"
      />
      {label}
    </label>
  );
}
