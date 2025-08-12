export function Weekday({ day, idx, workSchedule, handleChange }) {
  return (
    <div key={day.value} className="flex items-center gap-2">
      <label className="w-24 text-gray-700">{day.label}</label>
      <input
        type="time"
        value={workSchedule[idx].startTime}
        onChange={(e) => handleChange(idx, "startTime", e.target.value)}
        className="border rounded px-2 py-1"
      />
      <span>às</span>
      <input
        type="time"
        value={workSchedule[idx].endTime}
        onChange={(e) => handleChange(idx, "endTime", e.target.value)}
        className="border rounded px-2 py-1"
      />
    </div>
  );
}
