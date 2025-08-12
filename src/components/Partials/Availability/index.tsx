import { Slot } from "../Slot";

export function Availability({ day }) {
  return (
    <div key={day.date} className="bg-blue-50 rounded p-4">
      <div className="font-medium text-blue-800 mb-1">
        {day.label} ({day.date.split("-").reverse().join("/")})
      </div>

      {day.slots && day.slots.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {day.slots.map((slot, index) => (
            <Slot slot={slot} key={`${slot.start}-${index}`} />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm mt-2">
          Sem horários disponíveis
        </div>
      )}
    </div>
  );
}
