import { useState } from "react";
import api from "../api";

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !dueDate) {
      alert("Both title and due date are required");
      return;
    }

    try {
      let response;
      const payload = {
        title,
        due_date: dueDate,
        is_completed: false,
        ...(dueTime && { due_time: dueTime }),
      };

      try {
        response = await api.post("tasks/", payload);
      } catch (error) {
        // Backward-compatible fallback for APIs that don't support due_time yet.
        if (dueTime && error.response?.status === 400) {
          response = await api.post("tasks/", {
            title,
            due_date: dueDate,
            is_completed: false,
          });
        } else {
          throw error;
        }
      }

      // If success, notify parent
      onAdd(response.data);

      setTitle("");
      setDueDate("");
      setDueTime("");
    } catch (error) {
      if (error.response?.status === 403) {
        // ❌ Free plan limit reached
        alert("🚀 You have reached the free limit of 5 tasks. Upgrade to Premium to add more.");
      } else {
        alert("Something went wrong while adding the task.");
      }
    }
  };

  return (
    <section className="task-form-shell mb-4">
      <div className="task-form-head">
        <h3>Add New Task</h3>
        <p>Create a task with a due date to keep your workflow on track.</p>
      </div>

      <form onSubmit={handleSubmit} className="task-form-grid">
        <div className="task-form-field task-form-title">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            type="text"
            placeholder="Task title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="task-form-field task-form-date">
          <label htmlFor="task-due-date">Due Date</label>
          <input
            id="task-due-date"
            type="date"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={today}
          />
        </div>

        <div className="task-form-field task-form-time">
          <label htmlFor="task-due-time">Time</label>
          <input
            id="task-due-time"
            type="time"
            className="form-control"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <div className="task-form-action">
          <button type="submit" className="btn btn-primary w-100">
            Add Task
          </button>
        </div>
      </form>
    </section>
  );
};

export default TaskForm;
