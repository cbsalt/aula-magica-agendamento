import { useFormContext } from "react-hook-form";

export function InputText({ name, label, type = "text", ...props }) {
  const { register } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 my-2">
        {label}
      </label>
      <input
        {...register(name)}
        {...props}
        type={type}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}
