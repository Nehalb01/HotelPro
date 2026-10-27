import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBed, FaClipboardList, FaUser, FaHeadset, FaUserShield } from "react-icons/fa";
import Spinner from "../components/Spinner";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ checkIn: "", checkOut: "" });
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.data.bookings || res.data);
      } catch (err) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const upcoming = bookings.filter((b) => b.status === "booked").length;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (search.checkIn) q.set("checkIn", search.checkIn);
    if (search.checkOut) q.set("checkOut", search.checkOut);
    navigate(`/rooms?${q.toString()}`);
  };

  const actions = [
    { to: "/rooms", icon: <FaBed />, title: "Browse Rooms", text: "Explore our rooms" },
    { to: "/my-bookings", icon: <FaClipboardList />, title: "My Bookings", text: "View your bookings" },
    { to: "/profile", icon: <FaUser />, title: "Profile", text: "Manage your details" },
    user?.role === "admin"
      ? { to: "/admin", icon: <FaUserShield />, title: "Admin Panel", text: "Manage everything" }
      : { to: "mailto:support@hotelpro.com", icon: <FaHeadset />, title: "Support", text: "Get help anytime", external: true },
  ];

  return (
    <>
      <div className="page-header mb-4">
        <h2>
          {greeting}, {user?.name?.split(" ")[0]}
        </h2>
        <p>Here's what's happening with your bookings.</p>
      </div>

      <div
        className="rounded-4 p-4 p-md-5 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #0a3a2c, #2a7a62)" }}
      >
        <h4 className="brand-font text-center mb-3">Find Your Next Stay</h4>
        <form className="search-card mx-auto" onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4 col-6">
              <label>Check In</label>
              <input
                type="date"
                className="form-control"
                min={today}
                value={search.checkIn}
                onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
              />
            </div>
            <div className="col-md-4 col-6">
              <label>Check Out</label>
              <input
                type="date"
                className="form-control"
                min={search.checkIn || today}
                value={search.checkOut}
                onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100 py-2" type="submit">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="row mb-2">
        <div className="col-md-6 mb-3">
          <div className="panel-card p-3 text-center">
            <h3 className="mb-0">{upcoming}</h3>
            <small className="text-muted">Upcoming bookings</small>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="panel-card p-3 text-center">
            <h3 className="mb-0">{bookings.length}</h3>
            <small className="text-muted">Total bookings</small>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Quick Actions</h5>
      <div className="row">
        {actions.map((a) => {
          const card = (
            <div className="panel-card p-3 h-100 text-center">
              <div className="feature-icon mb-2">{a.icon}</div>
              <div className="fw-semibold text-dark">{a.title}</div>
              <small className="text-muted">{a.text}</small>
            </div>
          );
          return (
            <div className="col-lg-3 col-6 mb-3" key={a.title}>
              {a.external ? (
                <a href={a.to} className="text-decoration-none">
                  {card}
                </a>
              ) : (
                <Link to={a.to} className="text-decoration-none">
                  {card}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Dashboard;