import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpa,
} from "react-icons/fa";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const { name, email, phone, password } = form;
      await api.post("/auth/register", { name, email, phone, password });
      toast.success("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-side register">
        <Link to="/" className="text-white text-decoration-none d-flex align-items-center gap-2">
          <FaSpa size={22} />
          <span className="brand-font fs-4">HotelPro</span>
        </Link>
        <div>
          <h2 className="mb-1">More Stays</h2>
          <h2 className="mb-4">More Memories</h2>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-form">
          <h2 className="mb-1">Create Your Account</h2>
          <p className="text-muted mb-4">Join us and start booking your dream stays.</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                className="form-control"
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaEnvelope />
              </span>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaPhone />
              </span>
              <input
                className="form-control"
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaLock />
              </span>
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="input-group mb-4">
              <span className="input-group-text">
                <FaLock />
              </span>
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                name="confirm"
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary w-100 py-2" type="submit" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;