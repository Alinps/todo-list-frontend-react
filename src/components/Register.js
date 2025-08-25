// src/components/Register.js
import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("register/", { username, email, password, phone_number });
      console.log(phone_number);
      console.log(response);

      if (response.status === 200) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed. Try a different username.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg" style={{ width: "28rem" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4 fw-bold">Register</h2>
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
      </div>
    </div>
  );
};

export default Register;
