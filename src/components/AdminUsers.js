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
    <div className="d-flex flex-column align-items-center">
      <div className="d-flex flex-column flex-sm-row gap-2 mb-4 w-100" style={{maxWidth: 700}}>
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
        <input
          type="text"
          placeholder="Search username/email"
          className="form-control flex-grow-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchUsers} className="btn btn-outline-primary">
          Filter
        </button>
      </div>

      <div className="table-responsive" style={{maxWidth: 900, width: "100%"}}>
        <table className="table table-bordered table-hover text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Active</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email || "-"}</td>
                <td>{new Date(u.date_joined).toLocaleString()}</td>
                <td>{u.is_active ? "Yes" : "No"}</td>
                <td>{u.is_staff ? "Yes" : "No"}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
