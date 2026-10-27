import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaSpa,
  FaThLarge,
  FaClipboardList,
  FaBed,
  FaSignOutAlt,
  FaUserShield,
  FaPlusCircle,
  FaBars,
  FaHeadset,
} from "react-icons/fa";
import Footer from "./Footer";

function PublicLayout() {
  const token = localStorage.getItem("token");

  return (
    <>
      <nav className="navbar navbar-expand-md public-nav px-3 px-md-5 py-3">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <FaSpa /> <span className="brand-font">HotelPro</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publicNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="publicNav">
          <div className="navbar-nav mx-auto">
            <NavLink className="nav-link px-3" to="/" end>
              Home
            </NavLink>
            <NavLink className="nav-link px-3" to="/rooms">
              Rooms
            </NavLink>
          </div>
          <div className="d-flex gap-2 mt-2 mt-md-0">
            {token ? (
              <Link className="btn btn-primary" to="/dashboard">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-outline-primary" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link
          to="/"
          className="d-flex align-items-center gap-2 text-white text-decoration-none mb-4 px-2"
        >
          <FaSpa size={22} />
          <span className="brand-font fs-4">HotelPro</span>
        </Link>

        <nav className="flex-grow-1">
          <NavLink className="side-link" to="/dashboard">
            <FaThLarge /> Dashboard
          </NavLink>
          <NavLink className="side-link" to="/my-bookings">
            <FaClipboardList /> My Bookings
          </NavLink>
          <NavLink className="side-link" to="/rooms">
            <FaBed /> Rooms
          </NavLink>
          {user?.role === "admin" && (
            <>
              <NavLink className="side-link" to="/admin" end>
                <FaUserShield /> Admin
              </NavLink>
              <NavLink className="side-link" to="/admin/add-room">
                <FaPlusCircle /> Add Room
              </NavLink>
            </>
          )}
          <button className="side-link" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>

        <div className="help-box">
          <FaHeadset className="mb-2" />
          <div className="fw-semibold text-white">Need Help?</div>
          <div className="mb-2">Our support team is available 24/7.</div>
          <a
            className="btn btn-outline-light btn-sm w-100"
            href="mailto:support@hotelpro.com"
          >
            Contact Us
          </a>
        </div>
      </aside>
      <div className="sidebar-backdrop" onClick={() => setOpen(false)}></div>

      <div className="app-main">
        <div className="app-topbar">
          <button
            className="btn btn-light d-lg-none"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <FaBars />
          </button>
          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="fw-medium d-none d-sm-inline">{user?.name}</span>
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const token = localStorage.getItem("token");
  const { pathname } = useLocation();
  return token && pathname !== "/" ? <AppLayout /> : <PublicLayout />;
}

export default Shell;