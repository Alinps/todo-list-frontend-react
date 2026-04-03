// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("login/", { username, password });

      const { token, username: uname, user_id, is_staff, is_superuser } = response.data || {};
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ id: user_id, username: uname }));
        localStorage.setItem("is_admin", String(Boolean(is_staff || is_superuser)));
        navigate("/tasks");
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-page login-page vh-100">
      <div className="auth-split">
        <section className="auth-pane auth-pane-brand">
          <div className="auth-ambient-copy">
            <h1>PLAN. FOCUS. FINISH.</h1>
            <p>
              Turn every day into clear progress with a workspace built for focused task execution.
            </p>
          </div>
        </section>

        <section className="auth-pane auth-pane-form">
          <div className="auth-form-wrap">
            <h2 className="text-2xl font-bold mb-3 text-center text-gray-800">Login</h2>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group mb-4">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Login
              </button>
            </form>

            <p className="text-center text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
