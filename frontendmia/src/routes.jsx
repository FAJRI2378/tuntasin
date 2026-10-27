import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayouts"; // 1. Tambahkan import ini
import Home from "./pages/Home";
import Create from "./pages/Create";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCategories from "./pages/Admin/AdminCategories";

export const routes = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />, 
  },
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
    ],
  },
  {
    path: "/auth/:type",
    element: <Auth />,
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
    ],
  },
]);