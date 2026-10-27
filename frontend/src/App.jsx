import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import AddRoom from "./pages/AddRoom";
import EditRoom from "./pages/EditRoom";
import BookRoom from "./pages/BookRoom";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import RoomDetails from "./pages/RoomDetails";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <BookRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-room"
            element={
              <ProtectedRoute adminOnly={true}>
                <AddRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-room/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <EditRoom />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}

export default App;