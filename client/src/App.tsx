import { Route, Routes } from "react-router-dom";
import { AvailabilityPage } from "./pages/AvailabilityPage.js";
import { ExamplePage } from "./pages/ExamplePage.js";
import { HomePage } from "./pages/HomePage.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/example" element={<ExamplePage />} />
      <Route path="/example/:id/availability" element={<AvailabilityPage />} />
    </Routes>
  );
}
