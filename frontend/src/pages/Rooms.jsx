import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFilter } from "react-icons/fa";
import Spinner from "../components/Spinner";
import api from "../services/api";

const ROOM_TYPES = ["Single", "Double", "Deluxe", "Suite"];

function Rooms() {
  const [params] = useSearchParams();
  const initial = {
    search: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
  };

  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState(initial);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const today = new Date().toISOString().split("T")[0];

  const fetchRooms = async (f = filters) => {
    setError("");
    try {
      const query = {};
      Object.keys(f).forEach((k) => {
        if (f[k]) query[k] = f[k];
      });
      const res = await api.get("/rooms", { params: query });
      setRooms(res.data.rooms || res.data);
    } catch (err) {
      setRooms([]);
      setError(err.response?.data?.message || "Could not load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(initial);
    // eslint-disable-next-line
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

  const pickType = (t) => {
    const next = { ...filters, type: t };
    setFilters(next);
    fetchRooms(next);
  };

  const handleReset = () => {
    const cleared = { search: "", type: "", minPrice: "", maxPrice: "", checkIn: "", checkOut: "" };
    setFilters(cleared);
    fetchRooms(cleared);
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
      <div className="page-header mb-4">
        <h2>All Rooms</h2>
        <p>Choose from our wide range of rooms for a comfortable stay.</p>
      </div>

      <form className="panel-card p-3 mb-3" onSubmit={handleSearch}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3 col-6">
            <label className="form-label small text-muted mb-1">Check In</label>
            <input
              className="form-control"
              type="date"
              name="checkIn"
              min={today}
              value={filters.checkIn}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3 col-6">
            <label className="form-label small text-muted mb-1">Check Out</label>
            <input
              className="form-control"
              type="date"
              name="checkOut"
              min={filters.checkIn || today}
              value={filters.checkOut}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 d-flex gap-2">
            <button className="btn btn-primary px-4" type="submit">
              Search
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" /> Filter
            </button>
            <button className="btn btn-link" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="row g-3 mt-1">
            <div className="col-md-4">
              <label className="form-label small text-muted mb-1">Search</label>
              <input
                className="form-control"
                name="search"
                placeholder="Name, number or description"
                value={filters.search}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 col-6">
              <label className="form-label small text-muted mb-1">Min price</label>
              <input
                className="form-control"
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 col-6">
              <label className="form-label small text-muted mb-1">Max price</label>
              <input
                className="form-control"
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </form>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {["", ...ROOM_TYPES].map((t) => (
          <button
            key={t || "all"}
            className={`btn btn-sm rounded-pill px-3 ${
              filters.type === t ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => pickType(t)}
          >
            {t || "All Rooms"}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {rooms.length === 0 && !error && (
        <p className="text-center text-muted my-5">No rooms match your search.</p>
      )}

      <div className="row">
        {rooms.map((room) => (
          <div className="col-xl-4 col-md-6 mb-4" key={room._id}>
            <div className="card room-card h-100 shadow-sm">
              {room.image ? (
                <img src={room.image} className="card-img-top" alt={room.name || room.roomNumber} />
              ) : (
                <div className="room-placeholder">Room {room.roomNumber}</div>
              )}
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h5 className="mb-0">{room.name || `Room ${room.roomNumber}`}</h5>
                  <span className="badge bg-secondary">{room.type}</span>
                </div>
                <p className="text-muted small mb-2">Room {room.roomNumber}</p>
                <p className="small flex-grow-1">{room.description}</p>
                <p className="mb-3">
                  <span className="price-tag">₹{room.price}</span>
                  <span className="text-muted"> / night</span>
                </p>
                <Link
                  to={`/rooms/${room._id}${
                    filters.checkIn && filters.checkOut
                      ? `?checkIn=${filters.checkIn}&checkOut=${filters.checkOut}`
                      : ""
                  }`}
                  className="btn btn-primary w-100"
                >
                  View Details
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
    </>
  );
}

export default Rooms;