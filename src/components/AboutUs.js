import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TaskNavbar from "./TaskNavbar";
import api from "../api";
import { jsPDF } from "jspdf";

const AboutUs = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const importInputRef = useRef(null);
  const [tasks, setTasks] = useState([]);

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get("tasks/", {
          params: { status: "all" },
        });
        setTasks(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        console.error("Failed to fetch tasks for export:", err);
      }
    };

    fetchTasks();
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
    [tasks]
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

    alert("CSV imported successfully.");
  };

  return (
    <>
      <TaskNavbar
        username={user?.username}
        onTaskFormClick={() => navigate("/tasks")}
        onLogout={logout}
        exportHandlers={exportHandlers}
        onImportClick={() => importInputRef.current?.click()}
      />

      <div className="about-page container mt-5">
        <section className="about-content">
          <h2>About Us</h2>
          <p>
            We created this platform to remove friction from everyday task
            management. Instead of juggling scattered notes, reminders, and
            spreadsheets, you get one focused workspace to capture tasks, track
            progress, and close work with confidence.
          </p>
          <p>
            Our product philosophy is simple: clarity over clutter, speed over
            complexity, and consistency over chaos. Every screen is designed to
            help you decide what matters now and finish it faster.
          </p>
        </section>

        <section className="about-grid">
          <article className="about-block">
            <h3>What We Offer</h3>
            <p>
              Fast task creation, status-based filtering, due-date visibility,
              and one-click edit/delete workflows built for daily execution.
            </p>
          </article>
          <article className="about-block">
            <h3>Data Portability</h3>
            <p>
              Export your work in JSON, TXT, CSV, PDF, or SQL and import CSV
              files when migrating or collaborating with other tools.
            </p>
          </article>
          <article className="about-block">
            <h3>Admin Visibility</h3>
            <p>
              Built-in admin reporting and usage statistics provide transparency
              into user activity and operational trends.
            </p>
          </article>
        </section>

        <section className="about-content">
          <h3>Our Mission</h3>
          <p>
            We want your to-do list to feel actionable, not overwhelming. The
            mission is to help individuals and teams build dependable momentum
            through clean design, reliable workflows, and thoughtful tools.
          </p>
        </section>

        <input
          type="file"
          ref={importInputRef}
          accept=".csv"
          className="d-none"
          onChange={importCSV}
        />
      </div>
    </>
  );
};

export default AboutUs;
