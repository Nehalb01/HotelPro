import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
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
      toast.success("Booking confirmed!");
      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!room && !error) return <Spinner />;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>Book {room?.name || `Room ${room?.roomNumber}`}</h2>
          <p>Choose your dates and confirm your stay</p>
        </div>
      </div>

      <div className="container my-4">
        {error && !room && <div className="alert alert-danger">{error}</div>}
        {room && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card room-card shadow-sm">
                {room.image ? (
                  <img src={room.image} alt={room.name || room.roomNumber} />
                ) : (
                  <div className="room-placeholder">Room {room.roomNumber}</div>
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5>{room.name || `Room ${room.roomNumber}`}</h5>
                    <span className="badge bg-secondary">{room.type}</span>
                  </div>
                  <p className="text-muted small">Room {room.roomNumber}</p>
                  <p>{room.description}</p>
                  <p className="mb-0">
                    <span className="price-tag">₹{room.price}</span>
                    <span className="text-muted"> / night</span>
                  </p>
                </div>
              </div>

              {bookedRanges.length > 0 && (
                <div className="alert alert-warning mt-3 mb-0">
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
            </div>

            <div className="col-lg-7">
              <div className="card panel-card shadow-sm card-body p-4">
                <h5 className="mb-3">Your booking</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                {overlaps && !error && (
                  <div className="alert alert-danger">
                    These dates overlap an existing booking. Please choose other dates.
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Check-in</label>
                      <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Check-out</label>
                      <input
                        type="date"
                        className="form-control"
                        min={checkIn || today}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contact number"
                      />
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="bg-light rounded p-3 mt-4">
                      <div className="d-flex justify-content-between">
                        <span>
                          {nights} night(s) × ₹{room.price}
                        </span>
                        <strong>₹{nights * room.price}</strong>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-brand w-100 mt-4 py-2"
                    type="submit"
                    disabled={submitting || overlaps}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BookRoom;