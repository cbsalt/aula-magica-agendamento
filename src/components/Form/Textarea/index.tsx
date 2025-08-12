import { useFormContext } from "react-hook-form";

export function Textarea({ name, label, ...props }) {
  const { register } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 my-2">
        {label}
      </label>
      <textarea
        {...register(name)}
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
