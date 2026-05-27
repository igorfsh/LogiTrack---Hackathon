import { createBrowserRouter } from "react-router-dom";
import { Root } from "./layouts/Root";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { TrackingDetails } from "./pages/TrackingDetails";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "dashboard", Component: Dashboard },
      { path: "tracking/:code", Component: TrackingDetails },
      { path: "*", Component: NotFound },
    ],
  },
]);
