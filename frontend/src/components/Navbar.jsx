import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">HotelPro</Link>
      <div className="navbar-nav ms-auto">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/rooms">Rooms</Link>
{user?.role === "admin" && (
  <Link className="nav-link" to="/admin/add-room">Add Room</Link>
)}
        {token ? (
          <>
            <Link className="nav-link" to="/dashboard">Dashboard</Link>
            <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;