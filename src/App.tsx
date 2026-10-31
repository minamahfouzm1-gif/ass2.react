import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./Components/Layout/Layout";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import AuthLayout from "./Components/Layout/AuthLayout";
import NotFound from "./Pages/NotFound/NotFound";
import Notification from "./Pages/Notification/Notification";
import Setting from "./Pages/Setting/Setting";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import OriginalPost from "./Pages/OriginalPost/OriginalPost";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/originalpost",
        element: <OriginalPost />,
      },
      {
        path: "/feed",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/notification",
        element: <Notification />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
