import { formatPeriod } from "@/utils";

export function Slot({ slot }) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-mono ${
        slot.available
          ? "bg-green-200 text-green-900"
          : "bg-gray-200 text-gray-500 line-through"
      }`}
    >
      {formatPeriod(slot.start, slot.end)}
    </span>
  );
}
