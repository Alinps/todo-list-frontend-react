import React, { useState } from "react";
import EditTaskModal from "./EditTaskModal";

const TaskList = ({ tasks, onToggleComplete, onDelete, onEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const openEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const closeEdit = () => {
    setEditingTask(null);
    setShowModal(false);
  };

  return (
    <>
      <ul className="list-group">
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="form-check">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  checked={!!task.is_completed}
                  onChange={() => onToggleComplete(task)}
                  id={`task-${task.id}`}
                />
                <label
                  className={`form-check-label ${task.is_completed ? "text-decoration-line-through" : ""}`}
                  htmlFor={`task-${task.id}`}
                >
                  <strong>{task.title}</strong>{" "}
                  <small className="text-muted">({task.due_date})</small>
                </label>
              </div>

              <div className="btn-group">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(task)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(task.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item text-center text-muted">No tasks found.</li>
        )}
      </ul>

      <EditTaskModal
        show={showModal}
        onClose={closeEdit}
        task={editingTask}
        onSave={onEdit}
      />
    </>
  );
};

export default TaskList;
