import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Transactions from "./pages/finance/Transactions";
import Dashboard from "./pages/finance/Dashboard";

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
            path: "finance",
            children: [
              {
                path: "dashboard",
                element: <Dashboard />, // Rota do Dashboard
              },
              {
                path: "transactions",
                element: <Transactions />,
              },
            ],
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
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
