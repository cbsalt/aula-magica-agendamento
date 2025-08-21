import Select, { components } from "react-select";

const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, "0"),
  label: i.toString().padStart(2, "0"),
}));

const minutesOptions = ["00", "15", "30", "45"].map((m) => ({
  value: m,
  label: m,
}));

export function Weekday({ day, idx, workSchedule, setWorkSchedule }) {
  const ws = workSchedule[idx] || { startTime: "", endTime: "" };

  const [startHour, startMinute] = ws.startTime.split(":").map((v) => v || "");
  const [endHour, endMinute] = ws.endTime.split(":").map((v) => v || "");

  const updateTime = (type, field, value) => {
    setWorkSchedule((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;

        const currentTime = type === "start" ? item.startTime : item.endTime;
        let [hour = "", minute = ""] = currentTime.split(":");

        if (field === "hour") {
          hour = value || "";
          if (!minute) minute = "00";
        } else if (field === "minute") {
          minute = value || "00";
        }

        return {
          ...item,
          [type + "Time"]: hour ? `${hour}:${minute}` : "",
        };
      })
    );
  };

  const getOption = (options, value) =>
    options.find((o) => o.value === value) || null;

  const startTotal =
    startHour && startMinute
      ? parseInt(startHour) * 60 + parseInt(startMinute)
      : null;

  const filterEndHours = () =>
    startTotal
      ? hoursOptions.filter((h) => parseInt(h.value) * 60 >= startTotal)
      : hoursOptions;

  const filterEndMinutes = () =>
    startTotal && endHour
      ? minutesOptions.filter(
          (m) => parseInt(endHour) * 60 + parseInt(m.value) > startTotal
        )
      : minutesOptions;

  const fields = [
    {
      type: "start",
      hour: startHour,
      minute: startMinute,
      hoursOptions,
      minutesOptions,
    },
    {
      type: "end",
      hour: endHour,
      minute: endMinute,
      hoursOptions: filterEndHours(),
      minutesOptions: filterEndMinutes(),
    },
  ];

  const ClearIndicator = (props) => {
    return (
      <components.ClearIndicator
        {...props}
        className="group-hover:opacity-100 opacity-0 transition-opacity"
      />
    );
  };

  return (
    <div className="flex items-center gap-2">
      <label className="w-24 text-gray-700">{day.label}</label>

      {fields.map(({ type, hour, minute, hoursOptions, minutesOptions }) => (
        <div key={type} className="flex items-center gap-1 group">
          <Select
            value={getOption(hoursOptions, hour)}
            onChange={(option) => updateTime(type, "hour", option?.value)}
            options={hoursOptions}
            placeholder="HH"
            components={{ ClearIndicator }}
            isClearable
            className="w-32"
          />
          <Select
            value={getOption(minutesOptions, minute)}
            onChange={(option) => updateTime(type, "minute", option?.value)}
            options={minutesOptions}
            placeholder="MM"
            components={{ ClearIndicator }}
            isClearable
            className="w-32"
          />
          {type === "start" && <span className="ml-1">às</span>}
        </div>
      ))}
    </div>
  );
}
