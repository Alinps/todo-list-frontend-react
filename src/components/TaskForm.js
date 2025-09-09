import { useState } from "react";
import axios from "axios";

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !dueDate) {
      alert("Both title and due date are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Directly call backend API
      const response = await axios.post(
        "http://127.0.0.1:8000/api/tasks/",
        {
          title,
          due_date: dueDate,
          is_completed: false,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // If success, notify parent
      onAdd(response.data);

      setTitle("");
      setDueDate("");
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
    <div className="container">
      <form onSubmit={handleSubmit} className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <input
            type="text"
            placeholder="Task title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <input
            type="date"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={today}
          />
        </div>

        <div className="col-12 col-md-3">
          <button type="submit" className="btn btn-primary w-100">
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
