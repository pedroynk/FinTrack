import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Transactions from "./pages/finance/Transactions.tsx";
import Dashboard from "./pages/finance/Dashboard.tsx";
import Recurring from "./pages/finance/Recurring.tsx";

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
                element: <Dashboard />,
              },
              {
                path: "recurring",
                element: <Recurring />,
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
