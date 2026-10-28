import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayouts"; 
import Home from "./pages/Home";
import Create from "./pages/Create";
import Auth from "./pages/Auth";
import History from "./pages/Home";

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
        path: "/history",
        element: <History />,
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
        path: "categories",
        element: <AdminCategories />,
      },
      {
        path: "Submission",
        element: <AdminSubmissions />,
      },
    ],
  },
]);
