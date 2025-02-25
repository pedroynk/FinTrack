import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Transactions from "./pages/finance/Transactions";
import Dashboard from "./pages/finance/Dashboard";
import Recurring from "./pages/finance/Recurring";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            path: "finance/dashboard",
            element: <Dashboard />,
          },
          {
            path: "finance/recurring",
            element: <Recurring />,
          },
          {
            path: "finance/transactions",
            element: <Transactions />,
          },
        ],
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />, // Página 404
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
