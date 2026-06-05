import { Link } from "react-router-dom";

// Intentionally minimal: a clean landing so the root is free for live work.
// The reference scaffold lives behind /example.
export function HomePage() {
  return (
    <main>
      <h1>Snappr — Live Coding</h1>
      <p className="muted">Clean slate. Build your feature here.</p>
      <p>
        <Link to="/example">View the example →</Link>
      </p>
    </main>
  );
}
