import { useEffect, useState } from "react";
import api from "../services/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setError("");
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel booking");
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
      <h2 className="mb-4">My Bookings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {bookings.length === 0 && !error && <p>No bookings yet.</p>}
      <div className="row">
        {bookings.map((b) => (
          <div className="col-md-4 mb-3" key={b._id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{b.room?.name || "Room"}</h5>
                <p className="mb-1">
                  Check-in: {new Date(b.checkIn).toLocaleDateString()}
                </p>
                <p className="mb-1">
                  Check-out: {new Date(b.checkOut).toLocaleDateString()}
                </p>
                <p className="mb-2 fw-bold">Total: ₹{b.totalPrice}</p>
                <span className={`badge ${badge(b.status)} me-2`}>{b.status}</span>
                {b.status === "booked" && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => cancelBooking(b._id)}
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;