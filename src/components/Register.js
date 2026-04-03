// src/components/Register.js
import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm_password] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("register/", { username, email, password,confirm_password, phone_number });
      console.log(phone_number);
      console.log(response);

      if (response.status === 201) {
        setSuccess(response.data.message);
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Error response:", err.response);
      setError(err?.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="auth-page register-page vh-100 bg-light">
      <div className="auth-split">
        <section className="auth-pane auth-pane-brand">
          <div className="auth-ambient-copy">
            <h1>START YOUR PRODUCTIVE JOURNEY</h1>
            <p>
              Create your account to organize tasks, track progress, and stay on top of every goal.
            </p>
          </div>
        </section>

        <section className="auth-pane auth-pane-form">
          <div className="auth-form-wrap">
            <h2 className="text-2xl text-center mb-4 fw-bold">Register</h2>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Confirm Password"
                  value={confirm_password}
                  onChange={(e) => setConfirm_password(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  placeholder="Phone Number"
                  value={phone_number}
                  onChange={(e) => setPhone_number(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Register
              </button>
            </form>

            <p className="text-center text-muted mt-3 mb-0">
              Already have an account?{" "}
              <Link to="/login" className="text-primary text-decoration-underline">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
