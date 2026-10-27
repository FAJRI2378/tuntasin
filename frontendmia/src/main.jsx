import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import "./css/variable.css";
import 'leaflet/dist/leaflet.css'
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import SubmissionProvider from "./contexts/SubmissionContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SubmissionProvider>
      <RouterProvider router={routes} />
    </SubmissionProvider>
  </StrictMode>,
);
