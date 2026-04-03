import { useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import TaskNavbar from "./TaskNavbar";

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const importInputRef = useRef(null);

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");
  const [tasks] = useState([]);

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setUpgradeMsg("");
    try {
      const { data } = await api.post("profile/upgrade_premium/", {});
      const msg = data?.message || "You are now a premium user!";
      setUpgradeMsg(msg);
      toast.success(msg);
    } catch (error) {
      if (error.response?.status === 401) {
        setUpgradeMsg("Session expired. Please login again.");
      } else {
        setUpgradeMsg(error.response?.data?.message || "Upgrade failed. Please try again.");
      }
      toast.error("Could not upgrade to premium.");
    } finally {
      setUpgradeLoading(false);
    }
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

      <input
        type="file"
        ref={importInputRef}
        accept=".csv"
        className="d-none"
        onChange={() => {}}
      />

      <div className="container mt-5 profile-page">
        <section className="profile-head">
          <h2>Profile</h2>
          <p>Manage your account and unlock premium features.</p>
        </section>

        <section className="profile-info">
          <div>
            <span className="profile-label">Username</span>
            <h4>{user?.username || "User"}</h4>
          </div>
        </section>

        <section className="profile-premium">
          <h3>Premium Plan</h3>
          <p>
            Upgrade to premium to remove free-plan task limits and unlock a smoother
            productivity workflow.
          </p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleUpgrade}
            disabled={upgradeLoading}
          >
            {upgradeLoading ? "Upgrading..." : "Upgrade to Premium"}
          </button>
          {upgradeMsg && <p className="profile-upgrade-msg">{upgradeMsg}</p>}
        </section>
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

export default ProfilePage;
