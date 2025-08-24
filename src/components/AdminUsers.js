import React, { useEffect, useState } from "react";
import api from "../api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    const res = await api.get("admin/users/", {
      params: {
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        ...(search && { search }),
      },
    });
    setUsers(res.data || []);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="date"
          className="border rounded p-2"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="border rounded p-2"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search username/email"
          className="border rounded p-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchUsers} className="border rounded px-4">
          Filter
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">ID</th>
              <th className="text-left p-2 border">Username</th>
              <th className="text-left p-2 border">Email</th>
              <th className="text-left p-2 border">Joined</th>
              <th className="text-left p-2 border">Active</th>
              <th className="text-left p-2 border">Staff</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.username}</td>
                <td className="p-2 border">{u.email || "-"}</td>
                <td className="p-2 border">{new Date(u.date_joined).toLocaleString()}</td>
                <td className="p-2 border">{u.is_active ? "Yes" : "No"}</td>
                <td className="p-2 border">{u.is_staff ? "Yes" : "No"}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td className="p-2 border text-center" colSpan={6}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
