import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data.rooms || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    setError("");
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete room");
    }
  };

  if (loading) return <div className="container mt-5">Loading rooms...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Available Rooms</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {rooms.length === 0 && !error && <p>No rooms available yet.</p>}
      <div className="row">
        {rooms.map((room) => (
          <div className="col-md-4 mb-4" key={room._id}>
            <div className="card h-100 shadow-sm">
              {room.image && (
                <img
                  src={room.image}
                  className="card-img-top"
                  alt={room.name || room.roomNumber}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">
                  {room.name || `Room ${room.roomNumber}`}
                </h5>
                <p className="text-muted mb-1">
                  Room {room.roomNumber} · {room.type}
                </p>
                <p className="card-text">{room.description}</p>
                <p className="fw-bold">₹{room.price} / night</p>
                <Link to={`/book/${room._id}`} className="btn btn-primary w-100 mb-2">
                  Book Now
                </Link>
                {isAdmin && (
                  <div className="d-flex gap-2">
                    <Link
                      to={`/admin/edit-room/${room._id}`}
                      className="btn btn-outline-secondary btn-sm w-50"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm w-50"
                      onClick={() => handleDelete(room._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rooms;