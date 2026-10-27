import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import api from "../services/api";

const ROOM_TYPES = ["Single", "Double", "Deluxe", "Suite"];

const emptyFilters = {
  search: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  checkIn: "",
  checkOut: "",
};

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const today = new Date().toISOString().split("T")[0];

  const fetchRooms = async (f = filters) => {
    setError("");
    try {
      const params = {};
      Object.keys(f).forEach((k) => {
        if (f[k]) params[k] = f[k];
      });
      const res = await api.get("/rooms", { params });
      setRooms(res.data.rooms || res.data);
    } catch (err) {
      setRooms([]);
      setError(err.response?.data?.message || "Could not load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(emptyFilters);
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if ((filters.checkIn && !filters.checkOut) || (!filters.checkIn && filters.checkOut)) {
      setError("Please select both check-in and check-out dates");
      return;
    }
    fetchRooms(filters);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    fetchRooms(emptyFilters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    setError("");
    try {
      await api.delete(`/rooms/${id}`);
      toast.success("Room deleted");
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete room");
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>Our Rooms</h2>
          <p>Find the perfect room for your stay</p>
        </div>
      </div>

      <div className="container my-4">
        <form className="card panel-card shadow-sm card-body mb-4" onSubmit={handleSearch}>
          <div className="row g-3">
            <div className="col-lg-4 col-md-6">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                name="search"
                placeholder="Name, number or description"
                value={filters.search}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                name="type"
                value={filters.type}
                onChange={handleChange}
              >
                <option value="">All</option>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label">Min price</label>
              <input
                className="form-control"
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label">Max price</label>
              <input
                className="form-control"
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label">Check-in</label>
              <input
                className="form-control"
                type="date"
                name="checkIn"
                min={today}
                value={filters.checkIn}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label">Check-out</label>
              <input
                className="form-control"
                type="date"
                name="checkOut"
                min={filters.checkIn || today}
                value={filters.checkOut}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-6 d-flex align-items-end gap-2">
              <button className="btn btn-brand px-4" type="submit">
                Search
              </button>
              <button className="btn btn-outline-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}
        {rooms.length === 0 && !error && (
          <p className="text-center text-muted my-5">No rooms match your search.</p>
        )}

        <div className="row">
          {rooms.map((room) => (
            <div className="col-lg-4 col-md-6 mb-4" key={room._id}>
              <div className="card room-card h-100 shadow-sm">
                {room.image ? (
                  <img
                    src={room.image}
                    className="card-img-top"
                    alt={room.name || room.roomNumber}
                  />
                ) : (
                  <div className="room-placeholder">Room {room.roomNumber}</div>
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="card-title mb-0">
                      {room.name || `Room ${room.roomNumber}`}
                    </h5>
                    <span className="badge bg-secondary">{room.type}</span>
                  </div>
                  <p className="text-muted small mb-2">Room {room.roomNumber}</p>
                  <p className="card-text flex-grow-1">{room.description}</p>
                  <p className="mb-3">
                    <span className="price-tag">₹{room.price}</span>
                    <span className="text-muted"> / night</span>
                  </p>
                  <Link to={`/book/${room._id}`} className="btn btn-brand w-100">
                    Book Now
                  </Link>
                  {isAdmin && (
                    <div className="d-flex gap-2 mt-2">
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
    </>
  );
}

export default Rooms;