import type { AvailabilitySlot } from "@snappr/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAvailability, fetchPhotographer } from "../api.js";
import { addDays, mondayOf, shortDate, weekDays, weekdayLabel } from "../dates.js";
import { AvailabilityEditor } from "./AvailabilityEditor.js";

export function AvailabilityPage() {
  const { id } = useParams();
  const photographerId = Number(id);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [editing, setEditing] = useState(false);

  const photographer = useQuery({
    queryKey: ["photographer", photographerId],
    queryFn: () => fetchPhotographer(photographerId),
  });

  const availability = useQuery({
    queryKey: ["availability", photographerId, weekStart],
    queryFn: () => fetchAvailability(photographerId, weekStart),
  });

  const slotsByDate = groupByDate(availability.data ?? []);

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
