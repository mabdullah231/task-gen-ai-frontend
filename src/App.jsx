import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./screens/Layout";
import Helpers from "./Config/Helpers";
import { Login, Register, ForgetPassword } from "./screens";
import { AdminDashboard,AdminLayout, AdminSettings, AdminUsers } from "./screens/admin";
import { UserDashboard, UserLayout, UserPlans, UserSettings, UserTaskBot } from "./screens/user";

import './app.css'


const Auth = ({ children, isAuth = true, allowedRoles = [] }) => {
  let user = Helpers.getItem("user", true); // Get stored user
  let token = Helpers.getItem("token"); // Get stored token

  // If the route requires authentication
  if (isAuth) {
    if (!user || !token) {
      Helpers.toast("error", "Please login to continue");
      return <Navigate to="/" />;
    }

    // Check if user has permission to access the route
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(parseInt(user.user_type))
    ) {
      Helpers.toast("error", "Access denied.");

      switch (parseInt(user.user_type)) {
        case 0:
          return <Navigate to="/admin/dashboard" />;
        case 1:
          return <Navigate to="/admin/dashboard" />;
        case 2:
          return <Navigate to="/user/dashboard" />;
        default:
          return <Navigate to="/" />;
      }
    }

    return children; // User is authenticated and has access
  }

  // For public routes
  else {
    if (user && token) {
      switch (parseInt(user.user_type)) {
        case 0:
          return <Navigate to="/admin/dashboard" />;
        case 1:
          return <Navigate to="/admin/dashboard" />;
        case 2:
          return <Navigate to="/user/dashboard" />;
      }
    }
    return children;
  }
};

function App() {

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Auth isAuth={false}>
                <Login />
              </Auth>
            }
          />
          <Route
            path="register"
            element={
              <Auth isAuth={false}>
                <Register />
              </Auth>
            }
          />
          <Route
            path="forget-password"
            element={
              <Auth isAuth={false}>
                <ForgetPassword />
              </Auth>
            }
          />
        </Route>
          
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={
              <Auth allowedRoles={[0,1]}>
              {/* <Auth isAuth={false}> */}
                <AdminDashboard />
              </Auth>
            }
          />
          <Route
            path="users"
            element={
              <Auth allowedRoles={[0,1]}>
              {/* <Auth isAuth={false}> */}
                <AdminUsers />
              </Auth>
            }
          />
          <Route
            path="settings"
            element={
              <Auth allowedRoles={[0,1]}>
              {/* <Auth isAuth={false}> */}
                <AdminSettings />
              </Auth>
            }
          />
        </Route>
        <Route path="/user" element={<UserLayout />}>
          <Route
            path="dashboard"
            element={
              <Auth allowedRoles={[2]}>
              {/* // <Auth isAuth={false}> */}
                <UserDashboard />
              </Auth>
            }
          />
          <Route
            path="taskbot"
            element={
              <Auth allowedRoles={[2]}>
              {/* // <Auth isAuth={false}> */}
                <UserTaskBot />
              </Auth>
            }
          />
          <Route
            path="plans"
            element={
              <Auth allowedRoles={[2]}>
              {/* // <Auth isAuth={false}> */}
                <UserPlans />
              </Auth>
            }
          />
          <Route
            path="settings"
            element={
              <Auth allowedRoles={[2]}>
              {/* // <Auth isAuth={false}> */}
                <UserSettings />
              </Auth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
