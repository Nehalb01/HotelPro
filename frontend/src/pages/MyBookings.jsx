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
  const [tab, setTab] = useState("upcoming");
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

  const now = new Date();
  const isUpcoming = (b) =>
    (b.status === "booked" || b.status === "checked-in") && new Date(b.checkOut) >= now;
  const list = bookings.filter((b) => (tab === "upcoming" ? isUpcoming(b) : !isUpcoming(b)));

  return (
    <>
      <div className="page-header mb-4">
        <h2>My Bookings</h2>
        <p>View and manage your hotel bookings.</p>
      </div>

      <ul className="nav nav-tabs mb-3">
        {[
          ["upcoming", "Upcoming"],
          ["past", "Past"],
        ].map(([key, label]) => (
          <li className="nav-item" key={key}>
            <button
              className={`nav-link ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {error && <div className="alert alert-danger">{error}</div>}

      {list.length === 0 && !error && (
        <div className="text-center my-5">
          <p className="text-muted">No {tab} bookings.</p>
          <Link to="/rooms" className="btn btn-primary">
            Browse Rooms
          </Link>
        </div>
      )}

      {list.map((b) => {
        const nights = Math.ceil(
          (new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24)
        );
        return (
          <div className="panel-card p-3 mb-3" key={b._id}>
            <div className="row align-items-center g-3">
              <div className="col-md-2 col-4">
                {b.room?.image ? (
                  <img
                    src={b.room.image}
                    alt=""
                    className="w-100 rounded-3"
                    style={{ height: 80, objectFit: "cover" }}
                  />
                ) : (
                  <div className="room-placeholder rounded-3" style={{ height: 80 }}>
                    <small>Room</small>
                  </div>
                )}
              </div>
              <div className="col-md-5 col-8">
                <h6 className="mb-1">
                  {b.room?.name || `Room ${b.room?.roomNumber || ""}`}{" "}
                  <span className={`badge ${badgeClass(b.status)} ms-1`}>{b.status}</span>
                </h6>
                <small className="text-muted d-block">{b.room?.type}</small>
                <small className="text-muted">
                  {new Date(b.checkIn).toLocaleDateString()} -{" "}
                  {new Date(b.checkOut).toLocaleDateString()} ({nights} night
                  {nights > 1 ? "s" : ""})
                </small>
              </div>
              <div className="col-md-2 col-6">
                <div className="price-tag">₹{b.totalPrice}</div>
                <small className="text-muted">{b.guests} guest(s)</small>
              </div>
              <div className="col-md-3 col-6 text-md-end">
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
        );
      })}
    </>
  );
}

export default MyBookings;