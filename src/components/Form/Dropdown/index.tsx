import { useFormContext } from "react-hook-form";

export function Dropdown({ name, label, options = [], ...props }) {
  const { register } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 my-2">
        {label}
      </label>
      <select
        {...register(name)}
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
}
