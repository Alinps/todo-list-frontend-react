import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page min-h-screen">
      <div className="landing-shell container">
        <header className="landing-hero card">
          <div className="landing-badge">Smart Daily Planning</div>
          <h1 className="landing-title">Plan less. Finish more.</h1>
          <p className="landing-subtitle">
            A focused productivity workspace for tracking tasks, staying ahead
            of deadlines, and managing your team from one place.
          </p>

          <div className="landing-cta">
            <button onClick={() => navigate("/login")} className="btn btn-primary">
              Start as User
            </button>
            <button onClick={() => navigate("/admin/login")} className="btn btn-outline-secondary">
              Admin Access
            </button>
          </div>

          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">3x</span>
              <span className="landing-stat-label">Faster task planning</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">24/7</span>
              <span className="landing-stat-label">Progress visibility</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">100%</span>
              <span className="landing-stat-label">Cloud-based workflow</span>
            </div>
          </div>
        </header>

        <section className="landing-features">
          <article className="landing-feature card">
            <h3>Organize Effortlessly</h3>
            <p>Create, edit, and prioritize tasks in a clean interface designed for focus.</p>
          </article>
          <article className="landing-feature card">
            <h3>Track Every Milestone</h3>
            <p>Filter by status, search instantly, and keep your deadlines in view.</p>
          </article>
          <article className="landing-feature card">
            <h3>Admin Insights</h3>
            <p>Get user reports and platform activity stats to guide better decisions.</p>
          </article>
        </section>

        <footer className="landing-footer">
          <span>Ready to get things done?</span>
          <button onClick={() => navigate("/login")} className="btn btn-outline-primary">
            Go to Login
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
