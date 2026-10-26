import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [room, setRoom] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, b] = await Promise.all([
          api.get(`/rooms/${id}`),
          api.get(`/bookings/room/${id}/booked`),
        ]);
        setRoom(r.data.room || r.data);
        setBookedRanges(b.data);
      } catch (err) {
        setError("Could not load room details");
      }
    };
    load();
  }, [id]);

  const today = new Date().toISOString().split("T")[0];

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      : 0;

  const overlaps =
    nights > 0 &&
    bookedRanges.some(
      (r) =>
        new Date(r.checkIn) < new Date(checkOut) &&
        new Date(r.checkOut) > new Date(checkIn)
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (nights <= 0) {
      setError("Check-out must be after check-in");
      return;
    }
    if (overlaps) {
      setError("This room is already booked for the selected dates");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        room: id,
        checkIn,
        checkOut,
        guests: Number(guests),
        phone,
      });
      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!room && !error) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-1">Book {room?.name || `Room ${room?.roomNumber}`}</h2>
      {room && (
        <p className="text-muted">
          Room {room.roomNumber} · {room.type} · ₹{room.price} / night
        </p>
      )}

      {bookedRanges.length > 0 && (
        <div className="alert alert-warning">
          <strong>Already booked:</strong>
          <ul className="mb-0">
            {bookedRanges.map((r) => (
              <li key={r._id}>
                {new Date(r.checkIn).toLocaleDateString()} to{" "}
                {new Date(r.checkOut).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {overlaps && !error && (
        <div className="alert alert-danger">
          These dates overlap an existing booking. Please choose other dates.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="form-label">Check-in</label>
        <input
          type="date"
          className="form-control mb-3"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
        <label className="form-label">Check-out</label>
        <input
          type="date"
          className="form-control mb-3"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
        <label className="form-label">Guests</label>
        <input
          type="number"
          min="1"
          max="10"
          className="form-control mb-3"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          required
        />
        <label className="form-label">Phone</label>
        <input
          className="form-control mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Contact number"
        />

        {nights > 0 && room && (
          <p className="fw-bold">
            {nights} night(s) × ₹{room.price} = ₹{nights * room.price}
          </p>
        )}

        <button
          className="btn btn-primary w-100"
          type="submit"
          disabled={submitting || overlaps}
        >
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default BookRoom;