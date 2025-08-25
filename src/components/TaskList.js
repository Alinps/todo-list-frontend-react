import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "../context/AuthContext";
import api, { logEvent } from "../api";
import { jsPDF } from "jspdf";
import EditTaskModal from "./EditTaskModal";
import TaskForm from "./TaskForm";

const TaskList = () => {
  const { user, logout } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Download helper
  const downloadFile = useCallback((content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Unified export handlers
  const exportHandlers = useMemo(
    () => ({
      json: () =>
        downloadFile(
          JSON.stringify(tasks, null, 2),
          "tasks.json",
          "application/json"
        ),
      txt: () =>
        downloadFile(
          tasks
            .map(
              (t) =>
                `${t.title} — ${t.due_date} — ${
                  t.is_completed ? "Completed" : "Pending"
                }`
            )
            .join("\n"),
          "tasks.txt",
          "text/plain"
        ),
      csv: () => {
        const rows = tasks.map(
          (t) => `"${t.title}","${t.due_date}","${t.is_completed}"`
        );
        downloadFile(
          `Title,Due Date,Completed\n${rows.join("\n")}`,
          "tasks.csv",
          "text/csv"
        );
      },
      pdf: () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text("Tasks List", 10, 10);
        tasks.forEach((t, i) =>
          doc.text(
            `${i + 1}. ${t.title} — ${t.due_date} — ${
              t.is_completed ? "Completed" : "Pending"
            }`,
            10,
            20 + i * 8
          )
        );
        doc.save("tasks.pdf");
      },
      sql: () => {
        const stmts = tasks
          .map((t) => {
            const safe = t.title.replace(/'/g, "''");
            return `INSERT INTO tasks (title,due_date,is_completed) VALUES ('${safe}','${t.due_date}',${t.is_completed ? 1 : 0});`;
          })
          .join("\n");
        downloadFile(stmts, "tasks.sql", "text/sql");
      },
    }),
    [tasks, downloadFile]
  );

  // Fetch with optional cursor URL
  // const fetchTasks = useCallback(
  //   async (url = "tasks/", status = statusFilter, search = searchTerm) => {
  //     setLoading(true);
  //     setError("");
  //     try {
  //       const { data } = await api.get(url, {
  //         params: url.includes("?")
  //           ? {}
  //           : { status: status || undefined, search: search || undefined },
  //       });

  //       if (Array.isArray(data)) {
  //         setTasks(data);
  //         setNextPage(null);
  //         setPrevPage(null);
  //       } else {
  //         setTasks(data.results);
  //         setNextPage(data.next);
  //         setPrevPage(data.previous);
  //       }

  //       setStatusFilter(status);
  //     } catch (err) {
  //       console.error("Fetch error:", err);
  //       setError("Failed to load tasks.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [searchTerm, statusFilter]
  // );
  // Fetch with optional cursor URL (handles both relative + absolute URLs)
const fetchTasks = useCallback(
  async (url = "tasks/", status = statusFilter, search = searchTerm) => {
    setLoading(true);
    setError("");
    try {
      // If DRF gives absolute URL, let axios use it directly
      const finalUrl = url.startsWith("http") ? url : url;

      const { data } = await api.get(finalUrl, {
        params: finalUrl.includes("?")
          ? {}
          : { status: status || undefined, search: search || undefined },
      });

      if (Array.isArray(data)) {
        setTasks(data);
        setNextPage(null);
        setPrevPage(null);
      } else {
        setTasks(data.results);
        setNextPage(data.next);
        setPrevPage(data.previous);
      }

      setStatusFilter(status);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  },
  [searchTerm, statusFilter]
);


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (showToast) {
      const id = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(id);
    }
  }, [showToast]);

  // CRUD & utilities
  const handleAdd = async (task) => {
    try {
      const { data } = await api.post("tasks/", task);
      setTasks((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Could not add task.");
    }
  };

  const handleToggle = async (task) => {
    const updated = { ...task, is_completed: !task.is_completed };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updated : t))
    );

    try {
      await api.patch(`tasks/${task.id}/`, {
        is_completed: updated.is_completed,
      });
      await logEvent("toggle_complete", { taskId: task.id });
    } catch (err) {
      console.error(err);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
      setError("Could not update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task forever?")) return;
    const before = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.delete(`tasks/${id}/`);
      await logEvent("delete_task", { taskId: id });
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setTasks(before);
      setError("Could not delete task.");
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setEditingTask(null);
    setShowEditModal(false);
  };

  const handleSave = async (updated) => {
    const before = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );

    try {
      const { data } = await api.patch(
        `tasks/${updated.id}/`,
        updated
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === data.id ? data : t))
      );
      await logEvent("edit_task", { taskId: data.id });
      closeEdit();
    } catch (err) {
      console.error(err);
      setTasks(before);
      setError("Could not save changes.");
    }
  };

  const importCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    const start = lines[0].toLowerCase().includes("title") ? 1 : 0;

    for (let i = start; i < lines.length; i++) {
      const [title, due_date, is_completed] = lines[i]
        .replace(/"/g, "")
        .split(",")
        .map((s) => s.trim());
      if (!title || !due_date) continue;
      try {
        await api.post("tasks/", {
          title,
          due_date,
          is_completed: is_completed === "true",
        });
      } catch {
        // skip row errors
      }
    }

    fetchTasks();
    alert("Imported CSV!");
  };

  // Visible list (sorted client‐side)
  const visibleTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => new Date(a.due_date) - new Date(b.due_date)
      ),
    [tasks]
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">📝 To-Do App</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>Welcome, {user?.username}!</span>
        <button className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <TaskForm onAdd={handleAdd} />

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchTasks("tasks/", statusFilter, e.target.value);
            }}
          />
        </div>
        <div className="col-md-5">
          <div className="btn-group">
            {["", "pending", "completed"].map((s) => (
              <button
                key={s || "all"}
                className={`btn btn-outline-dark ${
                  statusFilter === s ? "active" : ""
                }`}
                onClick={() => fetchTasks("tasks/", s, searchTerm)}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-3 text-end">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Export/Import
            </button>
            <ul className="dropdown-menu">
              {Object.entries(exportHandlers).map(([key, fn]) => (
                <li key={key}>
                  <button className="dropdown-item" onClick={fn}>
                    Export as {key.toUpperCase()}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="dropdown-item mb-0"
                  type="button"
                  onClick={() => document.getElementById("import-csv").click()}
                >
                  Import CSV…
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <input
        type="file"
        id="import-csv"
        accept=".csv"
        className="d-none"
        onChange={importCSV}
      />

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading tasks…</div>
      ) : visibleTasks.length ? (
        <ul className="list-group">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="form-check">
                <input
                  type="checkbox"
                  checked={!!task.is_completed}
                  onChange={() => handleToggle(task)}
                  className="form-check-input me-2"
                  id={`task-${task.id}`}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`form-check-label ${
                    task.is_completed
                      ? "text-decoration-line-through text-muted"
                      : ""
                  }`}
                >
                  <strong>{task.title}</strong>{" "}
                  <small className="text-muted">({task.due_date})</small>
                </label>
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => openEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-muted">No tasks found.</div>
      )}

      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={!prevPage}
          onClick={() => fetchTasks(prevPage)}
        >
          ← Prev
        </button>
        <button
          className="btn btn-outline-primary"
          disabled={!nextPage}
          onClick={() => fetchTasks(nextPage)}
        >
          Next →
        </button>
      </div>

      {showToast && (
        <div
          className="toast-container position-fixed bottom-0 end-0 p-3 show"
          style={{ zIndex: 9999 }}
        >
          <div className="toast align-items-center text-bg-success border-0">
            <div className="d-flex">
              <div className="toast-body">Task deleted!</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToast(false)}
              />
            </div>
          </div>
        </div>
      )}

      <EditTaskModal
        show={showEditModal}
        task={editingTask}
        onClose={closeEdit}
        onSave={handleSave}
      />
    </div>
  );
};

export default TaskList;
