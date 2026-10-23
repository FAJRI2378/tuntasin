import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
]);
