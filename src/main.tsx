import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDb } from "./lib/db";

initDb().then(() => {
  createRoot(document.getElementById("root")!).render(
    <App />
  );
});
