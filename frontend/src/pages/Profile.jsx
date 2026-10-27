import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

function Profile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [info, setInfo] = useState({ name: stored?.name || "", phone: stored?.phone || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");

  const saveInfo = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.put("/users/me", info);
      const u = res.data;
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, id: u._id, name: u.name, phone: u.phone })
      );
      toast.success("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    try {
      await api.put("/users/me/password", pw);
      toast.success("Password changed");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Could not change password");
    }
  };

  return (
    <>
      <div className="page-header mb-4">
        <h2>Profile</h2>
        <p>Update your personal details.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <form className="panel-card p-4" onSubmit={saveInfo}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="avatar" style={{ width: 56, height: 56, fontSize: "1.3rem" }}>
                {stored?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="fw-semibold">{stored?.name}</div>
                <small className="text-muted">{stored?.email}</small>
              </div>
            </div>
            <h5 className="mb-3">Personal Information</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <label className="form-label">Full name</label>
            <input
              className="form-control mb-3"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              required
            />
            <label className="form-label">Email address</label>
            <input className="form-control mb-3" value={stored?.email || ""} disabled />
            <label className="form-label">Phone number</label>
            <input
              className="form-control mb-4"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            />
            <button className="btn btn-primary w-100" type="submit">
              Save Changes
            </button>
          </form>
        </div>

        <div className="col-lg-6">
          <form className="panel-card p-4" onSubmit={savePassword}>
            <h5 className="mb-3">Change Password</h5>
            {pwError && <div className="alert alert-danger py-2">{pwError}</div>}
            <label className="form-label">Current password</label>
            <input
              type="password"
              className="form-control mb-3"
              autoComplete="current-password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              required
            />
            <label className="form-label">New password</label>
            <input
              type="password"
              className="form-control mb-4"
              autoComplete="new-password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              required
            />
            <button className="btn btn-primary w-100" type="submit">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Profile;