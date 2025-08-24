import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // optional but supported
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(username, email, password);
      navigate("/tasks");
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: 380 }}>
        <h4 className="text-center mb-3">Create Account</h4>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Email (optional)</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          <button className="btn btn-success w-100 mt-2" type="submit">
            Register
          </button>
        </form>
        <div className="text-center mt-3">
          <small>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;
