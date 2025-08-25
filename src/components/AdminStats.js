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
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div>
        <div className="d-flex flex-column flex-sm-row gap-2 mb-4 justify-content-center">
          <input
            type="date"
            className="form-control"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <select
            className="form-select"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">All users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <button onClick={fetchStats} className="btn btn-outline-primary">
            Refresh
          </button>
        </div>

        {!stats ? (
          <p className="text-center">Loading…</p>
        ) : (
          <table className="table table-bordered table-hover mx-auto">
            <thead className="table-light">
              <tr>
                <th scope="col">Stat</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tasks Created</td>
                <td className="fw-bold">{stats.tasks_created}</td>
              </tr>
              <tr>
                <td>Tasks Updated</td>
                <td className="fw-bold">{stats.tasks_updated}</td>
              </tr>
              <tr>
                <td>Tasks Deleted</td>
                <td className="fw-bold">{stats.tasks_deleted}</td>
              </tr>
              <tr>
                <td>Marked Completed</td>
                <td className="fw-bold">{stats.tasks_completed}</td>
              </tr>
              <tr>
                <td>Marked Uncompleted</td>
                <td className="fw-bold">{stats.tasks_uncompleted}</td>
              </tr>
              <tr>
                <td>Imports</td>
                <td className="fw-bold">{stats.imports}</td>
              </tr>
              <tr>
                <td>Exports</td>
                <td className="fw-bold">{stats.exports}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
