import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import Spinner from "../components/Spinner";
import api from "../services/api";

const STEPS = ["Room Details", "Guest Details", "Payment", "Confirmation"];

function BookRoom() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [step, setStep] = useState(1);
  const [room, setRoom] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [checkIn, setCheckIn] = useState(params.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(params.get("checkOut") || "");
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState(user?.phone || "");
  const [card, setCard] = useState({ holder: "", number: "", expiry: "" });
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

  const goStep2 = () => {
    setError("");
    if (nights <= 0) return setError("Check-out must be after check-in");
    if (overlaps) return setError("This room is already booked for the selected dates");
    setStep(2);
  };

  const goStep3 = () => {
    setError("");
    if (!phone.trim()) return setError("Please enter a phone number");
    setStep(3);
  };

  const confirm = async () => {
    setError("");
    const digits = card.number.replace(/\s/g, "");
    if (!card.holder.trim()) return setError("Enter the card holder name");
    if (!/^\d{16}$/.test(digits)) return setError("Card number must be 16 digits");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
      return setError("Expiry must look like MM/YY");
    }
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        room: id,
        checkIn,
        checkOut,
        guests: Number(guests),
        phone,
        cardHolderName: card.holder,
        cardLast4: digits.slice(-4),
        cardExpiry: card.expiry,
      });
      toast.success("Booking confirmed!");
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!room && !error) return <Spinner />;
  if (!room) return <div className="alert alert-danger">{error}</div>;

  const total = nights * room.price;

  return (
    <>
      <div className="page-header mb-4">
        <h2>Book {room.name || `Room ${room.roomNumber}`}</h2>
      </div>

      {/* Step indicator */}
      <div className="d-flex justify-content-between mb-4" style={{ maxWidth: "700px" }}>
        {STEPS.map((label, i) => (
          <div key={label} className="text-center flex-fill">
            <div
              className="mx-auto d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 34,
                height: 34,
                background: step >= i + 1 ? "#0f4c3a" : "#e7e2d9",
                color: step >= i + 1 ? "#fff" : "#6b7a74",
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <small className={step === i + 1 ? "fw-semibold" : "text-muted"}>{label}</small>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Summary */}
        <div className="col-lg-4 order-lg-2">
          <div className="panel-card overflow-hidden">
            {room.image ? (
              <img src={room.image} alt="" className="w-100" style={{ height: 180, objectFit: "cover" }} />
            ) : (
              <div className="room-placeholder">Room {room.roomNumber}</div>
            )}
            <div className="p-3">
              <h5 className="mb-0">{room.name || `Room ${room.roomNumber}`}</h5>
              <small className="text-muted">
                {room.type} · Room {room.roomNumber}
              </small>
              <p className="mb-2 mt-2">
                <span className="price-tag">₹{room.price}</span>
                <span className="text-muted"> / night</span>
              </p>
              {nights > 0 && (
                <div className="border-top pt-2 small">
                  <div className="d-flex justify-content-between">
                    <span>Check-in</span>
                    <strong>{new Date(checkIn).toLocaleDateString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Check-out</span>
                    <strong>{new Date(checkOut).toLocaleDateString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>{nights} night(s)</span>
                    <strong>₹{total}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="col-lg-8 order-lg-1">
          <div className="panel-card p-4">
            {step === 1 && (
              <>
                <h5 className="mb-3">Choose your dates</h5>
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
                {overlaps && (
                  <div className="alert alert-danger">
                    These dates overlap an existing booking. Please choose other dates.
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Check-in</label>
                    <input
                      type="date"
                      className="form-control"
                      min={today}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
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
                    />
                  </div>
                </div>
                <button className="btn btn-primary w-100 mt-4 py-2" onClick={goStep2} disabled={overlaps}>
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h5 className="mb-3">Guest Details</h5>
                <label className="form-label">Full name</label>
                <input className="form-control mb-3" value={user?.name || ""} disabled />
                <label className="form-label">Email</label>
                <input className="form-control mb-3" value={user?.email || ""} disabled />
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Phone number</label>
                    <input
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                    />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button className="btn btn-primary flex-grow-1 py-2" onClick={goStep3}>
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h5 className="mb-1">Payment</h5>
                <p className="text-muted small">
                  Demo payment: no real charge is made. Only the last 4 digits are saved.
                </p>
                <label className="form-label">Card holder name</label>
                <input
                  className="form-control mb-3"
                  value={card.holder}
                  onChange={(e) => setCard({ ...card, holder: e.target.value })}
                />
                <label className="form-label">Card number</label>
                <input
                  className="form-control mb-3"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                />
                <label className="form-label">Expiry (MM/YY)</label>
                <input
                  className="form-control mb-3"
                  placeholder="08/28"
                  maxLength={5}
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                />
                <div className="d-flex justify-content-between bg-light rounded p-3 mb-3">
                  <span>Total to pay</span>
                  <strong>₹{total}</strong>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button
                    className="btn btn-primary flex-grow-1 py-2"
                    onClick={confirm}
                    disabled={submitting}
                  >
                    {submitting ? "Confirming..." : `Pay ₹${total} & Confirm`}
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="text-center py-4">
                <FaCheckCircle size={56} color="#0f4c3a" className="mb-3" />
                <h3>Booking Confirmed</h3>
                <p className="text-muted">
                  {room.name || `Room ${room.roomNumber}`} is booked from{" "}
                  {new Date(checkIn).toLocaleDateString()} to{" "}
                  {new Date(checkOut).toLocaleDateString()} ({nights} night
                  {nights > 1 ? "s" : ""}). Total: ₹{total}.
                </p>
                <Link to="/my-bookings" className="btn btn-primary me-2">
                  View My Bookings
                </Link>
                <Link to="/rooms" className="btn btn-outline-secondary">
                  Browse more rooms
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BookRoom;