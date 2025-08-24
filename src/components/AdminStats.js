import React, { useEffect, useState } from "react";
import api from "../api";

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userId, setUserId] = useState("");

  const fetchUsers = async () => {
    const res = await api.get("admin/users/");
    setUsers(res.data || []);
  };

  const fetchStats = async () => {
    const res = await api.get("admin/stats/", {
      params: {
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        ...(userId && { user_id: userId }),
      },
    });
    setStats(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
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
        <select
          className="border rounded p-2"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">All users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        <button onClick={fetchStats} className="border rounded px-4">
          Refresh
        </button>
      </div>

      {!stats ? (
        <p>Loading…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Tasks Created</div>
            <div className="text-2xl font-bold">{stats.tasks_created}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Tasks Updated</div>
            <div className="text-2xl font-bold">{stats.tasks_updated}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Tasks Deleted</div>
            <div className="text-2xl font-bold">{stats.tasks_deleted}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Marked Completed</div>
            <div className="text-2xl font-bold">{stats.tasks_completed}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Marked Uncompleted</div>
            <div className="text-2xl font-bold">{stats.tasks_uncompleted}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Imports</div>
            <div className="text-2xl font-bold">{stats.imports}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Exports</div>
            <div className="text-2xl font-bold">{stats.exports}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
