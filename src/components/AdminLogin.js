import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("login/", { username, password });
      const { token, username: uname, user_id, is_staff, is_superuser } = res.data || {};
      const isAdmin = Boolean(is_staff || is_superuser);

      if (!isAdmin) {
        setError("This account is not an admin.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id: user_id, username: uname }));
      localStorage.setItem("is_admin", "true");

      // Axios interceptor will start sending the token automatically.
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full border rounded-md p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin username"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="w-full bg-gray-900 text-white rounded-md py-2 hover:opacity-90">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
