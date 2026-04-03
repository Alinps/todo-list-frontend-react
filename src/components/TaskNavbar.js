import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const TaskNavbar = ({
  username,
  onTaskFormClick,
  onLogout,
  exportHandlers,
  onImportClick,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!exportMenuRef.current?.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="task-navbar-wrap">
      <div className="container">
        <div className="task-navbar">
          <div className="task-navbar-head">
            <div className="task-navbar-brand">
              <h2 className="mb-0">To-Do App</h2>
              <span>Welcome, {username}!</span>
            </div>
            <button
              type="button"
              className="task-navbar-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <div className={`task-navbar-actions ${menuOpen ? "is-open" : ""}`}>
            <span
              className="task-nav-link"
              onClick={() => {
                onTaskFormClick();
                setMenuOpen(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onTaskFormClick();
                  setMenuOpen(false);
                }
              }}
            >
              Task Form
            </span>
            <Link className="task-nav-link" to="/tasks/list" onClick={() => setMenuOpen(false)}>
              Task List
            </Link>
            <Link className="task-nav-link" to="/about" onClick={() => setMenuOpen(false)}>
              About Us
            </Link>
            <Link className="task-nav-link" to="/profile" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <div className="dropdown" ref={exportMenuRef}>
              <span
                className="task-nav-link dropdown-toggle"
                onClick={() => setShowExportMenu((prev) => !prev)}
                aria-expanded={showExportMenu}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowExportMenu((prev) => !prev);
                  }
                }}
              >
                Export/Import
              </span>
              <ul className={`dropdown-menu ${showExportMenu ? "show" : ""}`}>
                {Object.entries(exportHandlers).map(([key, fn]) => (
                  <li key={key}>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        fn();
                        setShowExportMenu(false);
                      }}
                    >
                      Export as {key.toUpperCase()}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className="dropdown-item mb-0"
                    type="button"
                    onClick={() => {
                      onImportClick();
                      setShowExportMenu(false);
                    }}
                  >
                    Import CSV...
                  </button>
                </li>
              </ul>
            </div>
            <span
              className="task-nav-link task-nav-danger"
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onLogout();
                  setMenuOpen(false);
                }
              }}
            >
              Logout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNavbar;
