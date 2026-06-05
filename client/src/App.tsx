import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchPhotographers } from "./api.js";

const CITIES = ["All", "Bogotá", "Medellín", "Cali", "Cartagena"] as const;

export function App() {
  const [city, setCity] = useState<string>("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["photographers", city],
    queryFn: () => fetchPhotographers(city === "All" ? undefined : city),
  });

  return (
    <main>
      <h1>Snappr — Photographers</h1>

      <div className="filters">
        {CITIES.map((c) => (
          <button
            key={c}
            className={c === city ? "active" : ""}
            onClick={() => setCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p className="error">{(error as Error).message}</p>}

      <ul className="cards">
        {data?.map((p) => (
          <li key={p.id} className="card">
            <div className="card-head">
              <strong>{p.name}</strong>
              <span className="rating">★ {p.rating.toFixed(1)}</span>
            </div>
            <div className="muted">{p.city}</div>
            <div className="rate">${p.hourlyRate}/hr</div>
          </li>
        ))}
      </ul>

      {data?.length === 0 && <p className="muted">No photographers in {city}.</p>}
    </main>
  );
}
