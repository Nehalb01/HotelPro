import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const ROOM_TYPES = ["Single", "Double", "Deluxe", "Suite"];

function AddRoom() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    roomNumber: "",
    name: "",
    type: ROOM_TYPES[0],
    price: "",
    description: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/rooms", { ...form, price: Number(form.price) });
      toast.success("Room added successfully");
      navigate("/rooms");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Add Room</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          name="roomNumber"
          placeholder="Room number (e.g. 101)"
          value={form.roomNumber}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-3"
          name="name"
          placeholder="Room name"
          value={form.name}
          onChange={handleChange}
        />
        <select
          className="form-select mb-3"
          name="type"
          value={form.type}
          onChange={handleChange}
        >
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          className="form-control mb-3"
          type="number"
          name="price"
          placeholder="Price per night"
          value={form.price}
          onChange={handleChange}
          required
        />
        <textarea
          className="form-control mb-3"
          name="description"
          placeholder="Description"
          rows="3"
          value={form.description}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          name="image"
          placeholder="Image URL (optional)"
          value={form.image}
          onChange={handleChange}
        />
        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Room"}
        </button>
      </form>
    </div>
  );
}

export default AddRoom;