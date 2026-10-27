import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBed, FaClipboardList, FaUserShield } from "react-icons/fa";
import Spinner from "../components/Spinner";
import api from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const upcoming = bookings.filter((b) => b.status === "booked").length;
  const total = bookings.length;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>Hello, {user?.name}</h2>
          <p>Here is a quick look at your account</p>
        </div>
      </div>

      <div className="container my-4">
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card panel-card shadow-sm card-body text-center">
              <h2 className="mb-0">{upcoming}</h2>
              <p className="text-muted mb-0">Upcoming bookings</p>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card panel-card shadow-sm card-body text-center">
              <h2 className="mb-0">{total}</h2>
              <p className="text-muted mb-0">Total bookings</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <Link to="/rooms" className="text-decoration-none">
              <div className="card room-card shadow-sm card-body text-center py-4">
                <div className="feature-icon mb-2">
                  <FaBed />
                </div>
                <h5 className="text-dark">Book a room</h5>
              </div>
            </Link>
          </div>
          <div className="col-md-4 mb-3">
            <Link to="/my-bookings" className="text-decoration-none">
              <div className="card room-card shadow-sm card-body text-center py-4">
                <div className="feature-icon mb-2">
                  <FaClipboardList />
                </div>
                <h5 className="text-dark">My bookings</h5>
              </div>
            </Link>
          </div>
          {user?.role === "admin" && (
            <div className="col-md-4 mb-3">
              <Link to="/admin" className="text-decoration-none">
                <div className="card room-card shadow-sm card-body text-center py-4">
                  <div className="feature-icon mb-2">
                    <FaUserShield />
                  </div>
                  <h5 className="text-dark">Admin panel</h5>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;