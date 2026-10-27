import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import api from "../services/api";

function RoomDetails() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data.room || res.data);
      } catch (err) {
        setError("Could not load this room");
      }
    };
    load();
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!room) return <Spinner />;

  const qs =
    params.get("checkIn") && params.get("checkOut")
      ? `?checkIn=${params.get("checkIn")}&checkOut=${params.get("checkOut")}`
      : "";

  return (
    <div className="panel-card p-3 p-md-4">
      <div className="row g-4">
        <div className="col-lg-6">
          {room.image ? (
            <img
              src={room.image}
              alt={room.name || room.roomNumber}
              className="w-100 rounded-3"
              style={{ maxHeight: "420px", objectFit: "cover" }}
            />
          ) : (
            <div className="room-placeholder rounded-3" style={{ height: "340px" }}>
              Room {room.roomNumber}
            </div>
          )}
        </div>
        <div className="col-lg-6">
          <span className="badge bg-secondary mb-2">{room.type}</span>
          <h2 className="mb-1">{room.name || `Room ${room.roomNumber}`}</h2>
          <p className="text-muted">Room {room.roomNumber}</p>
          <p className="mb-4">
            <span className="price-tag fs-3">₹{room.price}</span>
            <span className="text-muted"> / night</span>
          </p>
          <h5>About this room</h5>
          <p className="text-muted">{room.description || "No description added yet."}</p>
          <div className="d-flex gap-2 mt-4">
            <Link to={`/book/${room._id}${qs}`} className="btn btn-primary px-5 py-2">
              Book Now
            </Link>
            <Link to="/rooms" className="btn btn-outline-secondary py-2">
              Back to rooms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetails;