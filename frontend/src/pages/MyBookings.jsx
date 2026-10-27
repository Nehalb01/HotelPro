import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load bookings");
    } finally {
      setLoading(false);
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
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel booking");
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>My Bookings</h2>
          <p>View and manage your reservations</p>
        </div>
      </div>

      <div className="container my-4">
        {error && <div className="alert alert-danger">{error}</div>}

        {bookings.length === 0 && !error && (
          <div className="text-center my-5">
            <p className="text-muted">You have no bookings yet.</p>
            <Link to="/rooms" className="btn btn-brand">
              Browse Rooms
            </Link>
          </div>
        )}

        <div className="row">
          {bookings.map((b) => (
            <div className="col-lg-4 col-md-6 mb-4" key={b._id}>
              <div className="card panel-card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">
                      {b.room?.name || `Room ${b.room?.roomNumber || ""}`}
                    </h5>
                    <span className={`badge ${badgeClass(b.status)}`}>{b.status}</span>
                  </div>
                  <p className="text-muted small mb-3">{b.room?.type}</p>
                  <p className="mb-1">
                    <strong>Check-in:</strong> {new Date(b.checkIn).toLocaleDateString()}
                  </p>
                  <p className="mb-1">
                    <strong>Check-out:</strong> {new Date(b.checkOut).toLocaleDateString()}
                  </p>
                  <p className="mb-3">
                    <strong>Guests:</strong> {b.guests}
                  </p>
                  <p className="price-tag mb-3">₹{b.totalPrice}</p>
                  {b.status === "booked" && (
                    <button
                      className="btn btn-outline-danger btn-sm w-100"
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
    </>
  );
}

export default MyBookings;