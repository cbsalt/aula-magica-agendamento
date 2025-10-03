"use client";

import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Select from "react-select";

const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, "0"),
  label: i.toString().padStart(2, "0"),
}));

const minutesOptions = ["00", "15", "30", "45"].map((m) => ({
  value: m,
  label: m,
}));

interface TimePickerProps {
  label: string;
  idx: number;
  startTime: string;
  endTime: string;
  setData: (prev) => void;
  variant?: "work" | "interval";
}

export function TimePicker({
  label,
  idx,
  startTime,
  endTime,
  setData,
  variant,
}: TimePickerProps) {
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 640 : false;

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);

  const [localHour, setLocalHour] = useState("");
  const [localMinute, setLocalMinute] = useState("");

  const [startHour, startMinute] = (startTime ?? "")
    .split(":")
    .map((v) => v || "");
  const [endHour, endMinute] = (endTime ?? "").split(":").map((v) => v || "");

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

  const updateTime = (
    type: "start" | "end",
    field: "hour" | "minute",
    value: string
  ) => {
    setData((prev) =>
      prev.map((itm, i) => {
        if (i !== idx) return itm;

        const key = variant === "interval" ? type + "Interval" : type + "Time";

        const currentTime = itm[key] ?? "";
        let [hour = "", minute = ""] = currentTime.split(":");

        if (field === "hour") {
          hour = value || "";
          if (!minute) minute = "00";
        } else if (field === "minute") {
          minute = value || "00";
        }

        return {
          ...itm,
          [key]: hour ? `${hour}:${minute}` : "",
        };
      })
    );
  };

  const getOption = (options, value) =>
    options.find((o) => o.value === value) || null;

  const openDrawer = (field: "start" | "end") => {
    setActiveField(field);
    const [h, m] =
      field === "start"
        ? startTime.split(":").map((v) => v || "")
        : endTime.split(":").map((v) => v || "");
    setLocalHour(h);
    setLocalMinute(m);
    setDrawerOpen(true);
  };

  return (
    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full justify-between">
      <span className="text-gray-700">{label}</span>

      {/* Mobile */}
      <div className="flex gap-2 sm:hidden w-full">
        <button
          type="button"
          className="px-3 py-1 bg-gray-200 rounded flex-1"
          onClick={() => openDrawer("start")}
        >
          {startTime || "Início"}
        </button>
        <button
          type="button"
          className="px-3 py-1 bg-gray-200 rounded flex-1"
          onClick={() => openDrawer("end")}
        >
          {endTime || "Fim"}
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex flex-row items-center gap-2 flex-shrink">
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded min-w-12"
          onClick={() => openDrawer("start")}
        >
          {startTime || "Início"}
        </button>

        <span className="px-1 text-gray-500">às</span>

        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded min-w-12"
          onClick={() => openDrawer("end")}
        >
          {endTime || "Fim"}
        </button>
      </div>

      {/* Drawer */}
      <Dialog.Root open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />

          <Dialog.Content
            className={`
        fixed z-50 bg-white p-4 shadow-lg w-full max-w-md
        bottom-0 left-1/2 -translate-x-1/2 rounded-t-lg
        sm:top-1/2 sm:bottom-auto sm:rounded-lg sm:max-w-sm
        sm:-translate-y-1/2
      `}
          >
            <Dialog.Title className="text-lg font-semibold mb-4 text-center">
              {activeField === "start" ? "Escolher Início" : "Escolher Fim"}
            </Dialog.Title>

            <div className="flex flex-col gap-2 w-full sm:flex-row">
              <Select
                value={getOption(hoursOptions, localHour)}
                onChange={(option) => setLocalHour(option?.value || "")}
                options={
                  activeField === "start" ? hoursOptions : filterEndHours()
                }
                placeholder="HH"
                isClearable
                styles={{
                  container: (base) => ({ ...base, width: "100%" }),
                  control: (base) => ({ ...base, width: "100%" }),
                  menu: (base) => ({ ...base, width: "100%" }),
                }}
                {...(isMobile ? { menuPlacement: "top" } : {})}
              />
              <Select
                value={getOption(minutesOptions, localMinute)}
                onChange={(option) => setLocalMinute(option?.value || "")}
                options={
                  activeField === "start" ? minutesOptions : filterEndMinutes()
                }
                placeholder="MM"
                isClearable
                styles={{
                  container: (base) => ({ ...base, width: "100%" }),
                  control: (base) => ({ ...base, width: "100%" }),
                  menu: (base) => ({ ...base, width: "100%" }),
                }}
                {...(isMobile ? { menuPlacement: "top" } : {})}
              />
            </div>

            <Button
              className="mt-4 w-full sm:mt-6 mx-auto"
              onClick={() => {
                updateTime(activeField, "hour", localHour);
                updateTime(activeField, "minute", localMinute);
                setDrawerOpen(false);
              }}
            >
              Confirmar
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
