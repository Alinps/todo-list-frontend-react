import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import TaskForm from "./TaskForm";
import TaskNavbar from "./TaskNavbar";

const TaskList = () => {
  const { user, logout } = useContext(AuthContext);
  const formRef = useRef(null);
  const importInputRef = useRef(null);
  const [tasks, setTasks] = useState([]);

  const fetchTasksForExport = useCallback(async () => {
    try {
      const { data } = await api.get("tasks/", { params: { status: "all" } });
      setTasks(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load tasks for export:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasksForExport();
  }, [fetchTasksForExport]);

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

    await fetchTasksForExport();
    toast.success("Imported CSV!");
  };

  const openImportPicker = () => {
    importInputRef.current?.click();
  };

  const handleTaskFormJump = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdd = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    toast.success("Task added!");
  };

  return (
    <>
      <TaskNavbar
        username={user?.username}
        onTaskFormClick={handleTaskFormJump}
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

      <div className="container mt-5 task-form-page" ref={formRef}>
        <section className="task-form-page-head">
          <h2>Create Task</h2>
          <p>Add a task with title and due date.</p>
        </section>
        <TaskForm onAdd={handleAdd} />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
};

export default TaskList;
