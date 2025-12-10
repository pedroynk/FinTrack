import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import LoadingFallback from "./components/LoadingFallback"; // Import the component

const Login = lazy(() => import("./pages/admin/Login"));
const Movies = lazy(() => import("./pages/admin/movies/Movies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/admin/home/Dashboard"));
const Transactions = lazy(() => import("./pages/admin/finance/Transactions"));
const Recurring = lazy(() => import("./pages/admin/finance/Recurring"));
const Dimensions = lazy(() => import("./pages/admin/finance/Dimensions"));
//const StudyDimensions = lazy(() => import("./pages/admin/study/Dimensions"));
//const StudyQuestion = lazy(() => import("./pages/admin/study/Questions"));
//const StudyTimer = lazy(() => import("./pages/admin/study/Timer"));



const router = createBrowserRouter([

  {
    path: "/admin",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "finance",
            children: [
              {
                path: "dashboard",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                ),
              },
              {
                path: "recurring",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <Recurring />
                  </Suspense>
                ),
              },
              {
                path: "transactions",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <Transactions />
                  </Suspense>
                ),
              },
              {
                path: "dimensions",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <Dimensions />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: "movies",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <Movies />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
