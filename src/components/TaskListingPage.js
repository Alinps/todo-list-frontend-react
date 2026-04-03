import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import api, { logEvent } from "../api";
import EditTaskModal from "./EditTaskModal";
import TaskNavbar from "./TaskNavbar";
import Notifications from "./Notification";

const TaskListingPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const importInputRef = useRef(null);

  const downloadFile = useCallback((content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

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

  const fetchTasks = useCallback(
    async (url = "tasks/", status = statusFilter, search = searchTerm) => {
      setLoading(true);
      setError("");
      try {
        const statusParam = status === "all" ? "all" : status || undefined;
        const { data } = await api.get(url, {
          params: url.includes("?")
            ? {}
            : { status: statusParam, search: search || undefined },
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

  const handleToggle = async (task) => {
    const updated = { ...task, is_completed: !task.is_completed };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    try {
      await api.patch(`tasks/${task.id}/`, { is_completed: updated.is_completed });
      await logEvent("toggle_complete", { taskId: task.id });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
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
      toast.success("Task deleted!");
    } catch {
      setTasks(before);
      setError("Could not delete task.");
    }
  };

  const handleSave = async (updated) => {
    const before = tasks;
    const payload = {
      title: updated.title,
      due_date: updated.due_date,
      is_completed: updated.is_completed,
      due_time: updated.due_time || null,
    };
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    try {
      let data;
      try {
        ({ data } = await api.patch(`tasks/${updated.id}/`, payload));
      } catch (error) {
        // Backward-compatible fallback for APIs that don't support due_time yet.
        if (updated.due_time && error.response?.status === 400) {
          ({ data } = await api.patch(`tasks/${updated.id}/`, {
            title: updated.title,
            due_date: updated.due_date,
            is_completed: updated.is_completed,
          }));
        } else {
          throw error;
        }
      }
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      await logEvent("edit_task", { taskId: data.id });
      setEditingTask(null);
      setShowEditModal(false);
    } catch {
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

    fetchTasks("tasks/", statusFilter, searchTerm);
    toast.success("Imported CSV!");
  };

  const openImportPicker = () => {
    importInputRef.current?.click();
  };

  useEffect(() => {
    fetchTasks("tasks/", "all", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)),
    [tasks]
  );

  const formatTime = (timeValue) => {
    if (!timeValue) return "Not set";
    const date = new Date(`1970-01-01T${timeValue}`);
    if (Number.isNaN(date.getTime())) return timeValue;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <TaskNavbar
        username={user?.username}
        onTaskFormClick={() => navigate("/tasks")}
        onLogout={logout}
        exportHandlers={exportHandlers}
        onImportClick={openImportPicker}
      />

      <input
        type="file"
        ref={importInputRef}
        accept=".csv"
        className="d-none"
        onChange={importCSV}
      />

      <div className="container mt-5 task-list-area">
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="task-filter-shell mb-3">
          <div className="task-filter-head">
            <h3>Find and Filter</h3>
          </div>
          <div className="task-filter-grid">
            <div className="task-filter-search">
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
            <div className="task-filter-actions">
              <div className="btn-group">
                {["all", "pending", "completed"].map((s) => (
                  <button
                    key={s}
                    className={`btn btn-outline-dark ${
                      statusFilter === s ? "active" : ""
                    }`}
                    onClick={() => fetchTasks("tasks/", s, searchTerm)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                    id={`task-list-page-${task.id}`}
                  />
                  <label
                    htmlFor={`task-list-page-${task.id}`}
                    className={`form-check-label ${
                      task.is_completed ? "text-decoration-line-through text-muted" : ""
                    }`}
                  >
                    <strong>{task.title}</strong>
                    <div className="task-datetime-meta">
                      <span className="task-meta-item">Date: {task.due_date}</span>
                      <span className="task-meta-item">Time: {formatTime(task.due_time)}</span>
                    </div>
                  </label>
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setEditingTask(task);
                      setShowEditModal(true);
                    }}
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

        <div className="task-pagination mt-3">
          <button
            className="task-page-btn"
            disabled={!prevPage}
            onClick={() => fetchTasks(prevPage)}
          >
            <span className="task-page-arrow">←</span> Previous
          </button>
          <button
            className="task-page-btn"
            disabled={!nextPage}
            onClick={() => fetchTasks(nextPage)}
          >
            Next <span className="task-page-arrow">→</span>
          </button>
        </div>

        <EditTaskModal
          show={showEditModal}
          task={editingTask}
          onClose={() => {
            setEditingTask(null);
            setShowEditModal(false);
          }}
          onSave={handleSave}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />

        <Notifications />
      </div>
    </>
  );
};

export default TaskListingPage;
