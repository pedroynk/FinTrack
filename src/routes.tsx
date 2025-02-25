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
    path: "/", // Rota base
    element: <ProtectedRoute />, // Protege todas as rotas internas
    children: [
      {
        path: "/", // MainLayout é carregado aqui
        element: <MainLayout />,
        children: [
          {
            path: "finance/dashboard", // Removido "/" inicial
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
    path: "/login", // Corrigido com "/" inicial
    element: <Login />,
  },
  {
    path: "*", // Rota para páginas não encontradas
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
