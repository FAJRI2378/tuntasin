import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayouts";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Auth from "./pages/Auth";
import EditSubmission from "./pages/EditSubmission";
import PriorityHeatmap from "./pages/PriorityHeatmap";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminSubmissions from "./pages/Admin/AdminSubmissionn";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/create",
        element: <Create />,
      },
      {
        path: "/edit/:id",
        element: <EditSubmission />,
      },
      {
        path: "/heatmap", // Rute Peta Panas untuk User
        element: <PriorityHeatmap />,
      },
    ],
  },
  {
    path: "/login",
    element: <Auth type={"login"} />,
  },
  {
    path: "/register",
    element: <Auth type={"register"} />,
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },

      {
        path: "Categories",
        element: <AdminCategories />,
      },
      {
        path: "Submission",
        element: <AdminSubmissions />,
      },
      {
        path: "heatmap",
        element: <PriorityHeatmap />,
      },
    ],
  },
]);
