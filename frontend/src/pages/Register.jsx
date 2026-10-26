import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
  console.log(err.response);
  setError(
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Registration failed"
  );
}
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <h2 className="mb-4">Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-3"
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="off"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-3"
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          name="password"
          placeholder="Password"
           autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary w-100" type="submit">
          Register
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;