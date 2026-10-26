import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const ROOM_TYPES = ["Single", "Double", "Deluxe", "Suite"];

function EditRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        const r = res.data.room || res.data;
        setForm({
          roomNumber: r.roomNumber || "",
          name: r.name || "",
          type: r.type || ROOM_TYPES[0],
          price: r.price || "",
          description: r.description || "",
          image: r.image || "",
        });
      } catch (err) {
        setError("Could not load room");
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/rooms/${id}`, { ...form, price: Number(form.price) });
      navigate("/rooms");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update room");
    }
  };

  if (!form) return <div className="container mt-5">{error || "Loading..."}</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Edit Room</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          name="roomNumber"
          placeholder="Room number"
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
        <button className="btn btn-primary w-100" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditRoom;