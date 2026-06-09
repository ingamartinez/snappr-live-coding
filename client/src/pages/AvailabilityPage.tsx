import type { AvailabilitySlot } from "@snappr/shared";
import { CITIES } from "@snappr/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAvailability, fetchPhotographer, updatePhotographer } from "../api.js";
import {
  addDays,
  mondayOf,
  offsetDeltaLabel,
  shortDate,
  utcOffsetLabel,
  weekDays,
  weekdayLabel,
  weekReference,
} from "../dates.js";
import { defaultViewerCity } from "../timezones.js";
import { AvailabilityEditor } from "./AvailabilityEditor.js";

export function AvailabilityPage() {
  const { id } = useParams();
  const photographerId = Number(id);
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [editing, setEditing] = useState(false);
  const [viewer, setViewer] = useState(defaultViewerCity);

  const photographer = useQuery({
    queryKey: ["photographer", photographerId],
    queryFn: () => fetchPhotographer(photographerId),
  });

  const availability = useQuery({
    queryKey: ["availability", photographerId, weekStart],
    queryFn: () => fetchAvailability(photographerId, weekStart),
  });

  // Changing the photographer's city moves their timezone too (derived server-side).
  const cityMutation = useMutation({
    mutationFn: (city: string) => updatePhotographer(photographerId, { city }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["photographer", photographerId], updated);
    },
  });

  const slotsByDate = groupByDate(availability.data ?? []);
  const pe = photographer.data;
  const refDate = weekReference(weekStart);

  return (
    <main>
      <Link to="/example" className="back">
        ← Photographers
      </Link>
      <h1>{photographer.data ? `${photographer.data.name} — Availability` : "Availability"}</h1>

      <div className="week-nav">
        <button onClick={() => setWeekStart((w) => addDays(w, -7))} disabled={editing}>
          ← Prev week
        </button>
        <span className="muted">Week of {shortDate(weekStart)}</span>
        <button onClick={() => setWeekStart((w) => addDays(w, 7))} disabled={editing}>
          Next week →
        </button>
      </div>

      {pe &&
        (editing ? (
          <div className="tz-bar">
            <label className="tz-select">
              Photographer&rsquo;s city{" "}
              <select
                value={pe.city}
                disabled={cityMutation.isPending}
                onChange={(e) => cityMutation.mutate(e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="tz-note muted">
              Editing in {pe.city} local time ({utcOffsetLabel(pe.timezone, refDate)}).
            </p>
            {cityMutation.error && (
              <p className="error">{(cityMutation.error as Error).message}</p>
            )}
          </div>
        ) : (
          <div className="tz-bar">
            <label className="tz-select">
              Viewing from{" "}
              <select
                value={viewer.name}
                onChange={(e) =>
                  setViewer(CITIES.find((c) => c.name === e.target.value) ?? viewer)
                }
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="tz-note muted">
              Times shown in {pe.city} time ({utcOffsetLabel(pe.timezone, refDate)}).
              {viewer.timezone !== pe.timezone && (
                <>
                  {" "}
                  You&rsquo;re in {viewer.name} (
                  {offsetDeltaLabel(pe.timezone, viewer.timezone, refDate)} from {pe.city}).
                </>
              )}
            </p>
          </div>
        ))}

      {availability.isLoading && <p>Loading…</p>}
      {availability.error && <p className="error">{(availability.error as Error).message}</p>}

      {editing ? (
        <AvailabilityEditor
          photographerId={photographerId}
          weekStart={weekStart}
          initialSlots={availability.data ?? []}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="calendar">
            {weekDays(weekStart).map((date, i) => {
              const slots = slotsByDate.get(date) ?? [];
              return (
                <div key={date} className="day-col">
                  <div className="day-head">
                    <strong>{weekdayLabel(i)}</strong>
                    <span className="muted">{shortDate(date)}</span>
                  </div>
                  <div className="day-slots">
                    {slots.length > 0 ? (
                      slots.map((s) => (
                        <div key={s.id} className="slot">
                          {s.startTime}–{s.endTime}
                        </div>
                      ))
                    ) : (
                      <span className="muted off">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit availability
          </button>
        </>
      )}
    </main>
  );
}

function groupByDate(slots: AvailabilitySlot[]): Map<string, AvailabilitySlot[]> {
  const map = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const list = map.get(slot.date) ?? [];
    list.push(slot);
    map.set(slot.date, list);
  }
  return map;
}
