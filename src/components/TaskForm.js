import React, { useState } from "react";

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      alert("Both title and due date are required");
      return;
    }
    onAdd({ title, due_date: dueDate, is_completed: false });
    setTitle("");
    setDueDate("");
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
