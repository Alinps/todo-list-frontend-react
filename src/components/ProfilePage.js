import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import TaskNavbar from "./TaskNavbar";

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const importInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone_number: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const exportHandlers = useMemo(
    () => ({
      json: () => toast.info("Go to Task List page to export tasks."),
      txt: () => toast.info("Go to Task List page to export tasks."),
      csv: () => toast.info("Go to Task List page to export tasks."),
      pdf: () => toast.info("Go to Task List page to export tasks."),
      sql: () => toast.info("Go to Task List page to export tasks."),
    }),
    []
  );

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("profile/me/");
      setProfile(data);
      setEditForm({
        username: data?.username || "",
        email: data?.email || "",
        phone_number: data?.phone_number || "",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Could not load profile data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setUpgradeMsg("");
    try {
      const { data } = await api.post("profile/upgrade_premium/", {});
      const msg = data?.message || "You are now a premium user!";
      setUpgradeMsg(msg);
      toast.success(msg);
      await loadProfile();
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? "Session expired. Please login again."
          : err.response?.data?.message || "Upgrade failed. Please try again.";
      setUpgradeMsg(msg);
      toast.error("Could not upgrade to premium.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setEditLoading(true);
    setEditMsg("");

    const payload = {};
    ["username", "email", "phone_number"].forEach((k) => {
      const next = (editForm[k] || "").trim();
      const current = (profile[k] || "").trim();
      if (next !== current) payload[k] = next;
    });

    if (!Object.keys(payload).length) {
      setEditMsg("No changes to update.");
      setEditLoading(false);
      return;
    }

    try {
      const { data } = await api.patch("profile/update/", payload);
      setProfile(data);
      setEditForm({
        username: data?.username || "",
        email: data?.email || "",
        phone_number: data?.phone_number || "",
      });

      // Keep localStorage user in sync for navbar/context fallback.
      const storedUser = JSON.parse(localStorage.getItem("user") || "null") || {};
      const nextUser = {
        ...storedUser,
        username: data?.username || storedUser.username,
        id: data?.id || storedUser.id,
      };
      localStorage.setItem("user", JSON.stringify(nextUser));

      setEditMsg("Profile updated successfully.");
      toast.success("Profile updated.");
    } catch (err) {
      const apiMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.phone_number?.[0] ||
        err.response?.data?.detail ||
        "Could not update profile.";
      setEditMsg(apiMsg);
      toast.error("Profile update failed.");
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg("");

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordMsg("New password and confirm password must match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const { data } = await api.post("profile/change-password/", passwordForm);
      const newToken = data?.token || data?.new_token;
      if (newToken) {
        localStorage.setItem("token", newToken);
        api.defaults.headers.common.Authorization = `Token ${newToken}`;
      }

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      setPasswordMsg("Password changed successfully.");
      toast.success("Password updated.");
    } catch (err) {
      const apiMsg =
        err.response?.data?.current_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.confirm_new_password?.[0] ||
        err.response?.data?.detail ||
        "Could not change password.";
      setPasswordMsg(apiMsg);
      toast.error("Password change failed.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <TaskNavbar
        username={profile?.username || user?.username}
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
          <p>View account details, update profile info, and manage password securely.</p>
        </section>

        {loading ? (
          <p className="text-muted">Loading profile...</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <section className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-label">Username</span>
                <h4>{profile?.username || "-"}</h4>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Email</span>
                <h4>{profile?.email || "-"}</h4>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Phone</span>
                <h4>{profile?.phone_number || "-"}</h4>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Joined</span>
                <h4>{formatDate(profile?.date_joined)}</h4>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Plan</span>
                <h4>{profile?.is_premium ? "Premium" : "Free"}</h4>
              </div>
            </section>

            <section className="profile-premium">
              <h3>Premium Upgrade</h3>
              <p>
                Upgrade to premium to remove free-plan task limits and unlock a smoother
                productivity workflow.
              </p>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleUpgrade}
                disabled={upgradeLoading || profile?.is_premium}
              >
                {profile?.is_premium
                  ? "Premium Active"
                  : upgradeLoading
                  ? "Upgrading..."
                  : "Upgrade to Premium"}
              </button>
              {upgradeMsg && <p className="profile-upgrade-msg">{upgradeMsg}</p>}
            </section>

            <section className="profile-toggle-row">
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={() => {
                  setShowEditForm((prev) => !prev);
                  if (!showEditForm) setShowPasswordForm(false);
                }}
              >
                {showEditForm ? "Hide Edit Profile" : "Edit Profile"}
              </button>
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={() => {
                  setShowPasswordForm((prev) => !prev);
                  if (!showPasswordForm) setShowEditForm(false);
                }}
              >
                {showPasswordForm ? "Hide Change Password" : "Change Password"}
              </button>
            </section>

            {showEditForm && (
              <section className="profile-panel">
                <form className="profile-form-grid" onSubmit={handleProfileUpdate}>
                  <div className="profile-field">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.username}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.phone_number}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, phone_number: e.target.value }))
                      }
                    />
                  </div>
                  <div className="profile-actions">
                    <button className="btn btn-primary" type="submit" disabled={editLoading}>
                      {editLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
                {editMsg && <p className="profile-form-msg">{editMsg}</p>}
              </section>
            )}

            {showPasswordForm && (
              <section className="profile-panel">
                <form className="profile-form-grid" onSubmit={handlePasswordChange}>
                  <div className="profile-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          current_password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="profile-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          new_password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="profile-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.confirm_new_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirm_new_password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="profile-actions">
                    <button className="btn btn-primary" type="submit" disabled={passwordLoading}>
                      {passwordLoading ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </form>
                {passwordMsg && <p className="profile-form-msg">{passwordMsg}</p>}
              </section>
            )}
          </>
        )}
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
