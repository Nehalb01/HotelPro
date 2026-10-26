import { useEffect, useState } from "react";
import api from "../services/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchRooms();
  }, []);

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
                  alt={room.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{room.name}</h5>
                <p className="text-muted mb-1">{room.type}</p>
                <p className="card-text">{room.description}</p>
                <p className="fw-bold">₹{room.price} / night</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rooms;