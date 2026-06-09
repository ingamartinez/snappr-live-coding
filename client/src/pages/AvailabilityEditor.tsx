import type { AvailabilitySlot } from "@snappr/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { setAvailability } from "../api.js";
import { shortDate, weekDays, weekdayLabel } from "../dates.js";

interface Interval {
  startTime: string;
  endTime: string;
}

interface Props {
  photographerId: number;
  weekStart: string;
  initialSlots: AvailabilitySlot[];
  onDone: () => void;
}

// Edits the whole week locally, then submits it as one full-replace PUT.
export function AvailabilityEditor({ photographerId, weekStart, initialSlots, onDone }: Props) {
  const queryClient = useQueryClient();
  const [byDate, setByDate] = useState<Record<string, Interval[]>>(() =>
    initFromSlots(initialSlots),
  );

  const mutation = useMutation({
    mutationFn: () => setAvailability(photographerId, { weekStart, slots: toSlots(byDate) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", photographerId, weekStart],
      });
      onDone();
    },
  });

  const addInterval = (date: string) =>
    setByDate((prev) => ({
      ...prev,
      [date]: [...(prev[date] ?? []), { startTime: "09:00", endTime: "17:00" }],
    }));

  const removeInterval = (date: string, idx: number) =>
    setByDate((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).filter((_, i) => i !== idx),
    }));

  const updateInterval = (date: string, idx: number, field: keyof Interval, value: string) =>
    setByDate((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).map((iv, i) => (i === idx ? { ...iv, [field]: value } : iv)),
    }));

  return (
    <div className="editor">
      {weekDays(weekStart).map((date, i) => (
        <div key={date} className="editor-day">
          <div className="editor-day-head">
            <strong>{weekdayLabel(i)}</strong> <span className="muted">{shortDate(date)}</span>
          </div>
          {(byDate[date] ?? []).map((iv, idx) => (
            <div key={idx} className="editor-row">
              <input
                type="time"
                value={iv.startTime}
                onChange={(e) => updateInterval(date, idx, "startTime", e.target.value)}
              />
              <span>–</span>
              <input
                type="time"
                value={iv.endTime}
                onChange={(e) => updateInterval(date, idx, "endTime", e.target.value)}
              />
              <button type="button" className="link-danger" onClick={() => removeInterval(date, idx)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="add-interval" onClick={() => addInterval(date)}>
            + Add interval
          </button>
        </div>
      ))}

      {mutation.error && <p className="error">{(mutation.error as Error).message}</p>}

      <div className="editor-actions">
        <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save week"}
        </button>
        <button type="button" className="secondary" onClick={onDone} disabled={mutation.isPending}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function initFromSlots(slots: AvailabilitySlot[]): Record<string, Interval[]> {
  const map: Record<string, Interval[]> = {};
  for (const slot of slots) {
    (map[slot.date] ??= []).push({ startTime: slot.startTime, endTime: slot.endTime });
  }
  return map;
}

function toSlots(
  byDate: Record<string, Interval[]>,
): Array<{ date: string; startTime: string; endTime: string }> {
  return Object.entries(byDate).flatMap(([date, intervals]) =>
    intervals.map((iv) => ({ date, startTime: iv.startTime, endTime: iv.endTime })),
  );
}
