import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data.room || res.data);
      } catch (err) {
        setError("Could not load room");
      }
    };
    fetchRoom();
  }, [id]);

  const today = new Date().toISOString().split("T")[0];

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (nights <= 0) {
      setError("Check-out must be after check-in");
      return;
    }
    try {
      await api.post("/bookings", { room: id, checkIn, checkOut });
      alert("Booking confirmed");
      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  if (!room && !error) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-3">Book {room?.name}</h2>
      {room && <p className="text-muted">₹{room.price} / night</p>}
      {error && <div className="alert alert-danger">{error}</div>}
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
        {nights > 0 && room && (
          <p className="fw-bold">
            {nights} night(s) = ₹{nights * room.price}
          </p>
        )}
        <button className="btn btn-primary w-100" type="submit">
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default BookRoom;