import { useEffect, useState } from "react";
import { FaClipboardList, FaCalendarCheck, FaUsers, FaRupeeSign } from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import api from "../services/api";

const badgeClass = (status) =>
  status === "checked-in"
    ? "bg-success"
    : status === "checked-out"
    ? "bg-secondary"
    : status === "cancelled"
    ? "bg-danger"
    : "bg-primary";

function AdminDashboard() {
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [b, u] = await Promise.all([api.get("/bookings"), api.get("/users")]);
      setBookings(b.data.bookings || b.data);
      setUsers(u.data.users || u.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking marked ${status}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update booking");
    }
  };

  if (loading) return <Spinner />;

  const revenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const stats = [
    {
      label: "Total bookings",
      value: bookings.length,
      icon: <FaClipboardList />,
      color: "#2a6f97",
    },
    {
      label: "Active (booked)",
      value: bookings.filter((b) => b.status === "booked").length,
      icon: <FaCalendarCheck />,
      color: "#198754",
    },
    { label: "Users", value: users.length, icon: <FaUsers />, color: "#6f42c1" },
    {
      label: "Revenue",
      value: `₹${revenue}`,
      icon: <FaRupeeSign />,
      color: "#fd7e14",
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>Admin Dashboard</h2>
          <p>Manage bookings and users</p>
        </div>
      </div>

      <div className="container my-4">
        <div className="row mb-4">
          {stats.map((s) => (
            <div className="col-lg-3 col-sm-6 mb-3" key={s.label}>
              <div className="card panel-card shadow-sm">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <h4 className="mb-0">{s.value}</h4>
                    <small className="text-muted">{s.label}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "bookings" ? "active" : ""}`}
              onClick={() => setTab("bookings")}
            >
              Bookings
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "users" ? "active" : ""}`}
              onClick={() => setTab("users")}
            >
              Users
            </button>
          </li>
        </ul>

        {tab === "bookings" && (
          <div className="card panel-card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No bookings yet
                      </td>
                    </tr>
                  )}
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        {b.user?.name}
                        <br />
                        <small className="text-muted">{b.user?.email}</small>
                      </td>
                      <td>{b.room?.name || b.room?.roomNumber}</td>
                      <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td>₹{b.totalPrice}</td>
                      <td>
                        <span className={`badge ${badgeClass(b.status)}`}>{b.status}</span>
                      </td>
                      <td className="text-nowrap">
                        <button
                          className="btn btn-success btn-sm me-1"
                          disabled={b.status !== "booked"}
                          onClick={() => updateStatus(b._id, "checked-in")}
                        >
                          Check-in
                        </button>
                        <button
                          className="btn btn-secondary btn-sm me-1"
                          disabled={b.status !== "checked-in"}
                          onClick={() => updateStatus(b._id, "checked-out")}
                        >
                          Check-out
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={b.status === "cancelled" || b.status === "checked-out"}
                          onClick={() => updateStatus(b._id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="card panel-card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span
                          className={`badge ${u.role === "admin" ? "bg-warning text-dark" : "bg-light text-dark border"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;