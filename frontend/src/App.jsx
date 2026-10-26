import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import AddRoom from "./pages/AddRoom";
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/rooms" element={<Rooms />} />
<Route
  path="/admin/add-room"
  element={
    <ProtectedRoute adminOnly={true}>
      <AddRoom />
    </ProtectedRoute>
  }
/>
      </Routes>
    </>
  );
}

export default App;