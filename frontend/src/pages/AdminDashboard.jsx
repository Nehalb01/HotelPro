import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [b, u] = await Promise.all([api.get("/bookings"), api.get("/users")]);
      setBookings(b.data.bookings || b.data);
      setUsers(u.data.users || u.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update booking");
    }
  };

  const badge = (status) =>
    status === "checked-in"
      ? "bg-success"
      : status === "checked-out"
      ? "bg-secondary"
      : status === "cancelled"
      ? "bg-danger"
      : "bg-primary";

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3>{bookings.length}</h3>
              <p className="mb-0 text-muted">Total bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3>{bookings.filter((b) => b.status === "booked").length}</h3>
              <p className="mb-0 text-muted">Active (booked)</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h3>{users.length}</h3>
              <p className="mb-0 text-muted">Users</p>
            </div>
          </div>
        </div>
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
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
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
                  <td colSpan="7" className="text-center">No bookings yet</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.user?.name}
                    <br />
                    <small className="text-muted">{b.user?.email}</small>
                  </td>
                  <td>{b.room?.name}</td>
                  <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td>₹{b.totalPrice}</td>
                  <td>
                    <span className={`badge ${badge(b.status)}`}>{b.status}</span>
                  </td>
                  <td>
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
      )}

      {tab === "users" && (
        <div className="table-responsive">
          <table className="table table-bordered">
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
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;