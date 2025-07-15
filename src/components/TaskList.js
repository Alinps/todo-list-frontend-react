// //TaskList.js
// import React from 'react';

// const TaskList = ({ tasks = [] }) => {
//   return (
//     <ul className="list-group">
//       {tasks.map(task => (
//         <li key={task.id} className="list-group-item d-flex justify-content-between">
//           <span>{task.title}</span>
//           <span className={`badge ${task.is_completed ? 'bg-success' : 'bg-warning'}`}>
//             {task.due_date}
//           </span>
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default TaskList;




// import React from 'react';

// const TaskList = ({ tasks = [], onToggleComplete, onDelete }) => {
//   return (
//     <ul className="list-group">
//       {tasks.map(task => (
//         <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
//           <div>
//             <strong>{task.title}</strong> <br />
//             <small className={`badge ${task.is_completed ? 'bg-success' : 'bg-warning'}`}>
//               {task.due_date}
//             </small>
//           </div>
//           <div>
//             <button
//               className={`btn btn-sm ${task.is_completed ? 'btn-secondary' : 'btn-success'} me-2`}
//               onClick={() => onToggleComplete(task)}
//             >
//               {task.is_completed ? 'Undo' : 'Done'}
//             </button>
//             <button className="btn btn-sm btn-danger" onClick={() => onDelete(task.id)}>
//               Delete
//             </button>
//           </div>
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default TaskList;     //working code before adding edit 

import React, { useState } from 'react';

const TaskList = ({ tasks = [], onToggleComplete, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDate(task.due_date);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDate('');
  };

  const saveEdit = () => {
    if (!editTitle.trim() || !editDate) {
      alert('Both title and date are required!');
      return;
    }
    onEdit(editingId, { title: editTitle, due_date: editDate });
    cancelEdit();
  };

  return (
    <ul className="list-group">
      {tasks.map(task => (
        <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
          {editingId === task.id ? (
            <div className="flex-grow-1 me-3">
              <input
                type="text"
                className="form-control mb-1"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>
          ) : (
            <div>
              <strong>{task.title}</strong> <br />
              <small className={`badge ${task.is_completed ? 'bg-success' : 'bg-warning'}`}>
                {task.due_date}
              </small>
            </div>
          )}

          <div className="btn-group btn-group-sm">
            {editingId === task.id ? (
              <>
                <button className="btn btn-outline-success" onClick={saveEdit}>💾 Save</button>
                <button className="btn btn-outline-secondary" onClick={cancelEdit}>✖ Cancel</button>
              </>
            ) : (
              <>
                <button
                  className={`btn ${task.is_completed ? 'btn-outline-secondary' : 'btn-outline-success active'} me-1`}
                  onClick={() => onToggleComplete(task)}
                >
                  {task.is_completed ? 'Undo' : 'Done'}
                </button>
                <button className="btn btn-outline-primary me-1" onClick={() => startEdit(task)}>✏️ Edit</button>
                <button className="btn btn-outline-danger" onClick={() => onDelete(task.id)}>🗑 Delete</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;   //working code before adding edit modal


// import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// import { Modal } from 'bootstrap';


// const TaskList = ({ tasks = [], onToggleComplete, onDelete, onEdit }) => {
//   const [editingTask, setEditingTask] = useState(null);
//   const [editTitle, setEditTitle] = useState('');
//   const [editDate, setEditDate] = useState('');

//   const startEdit = (task) => {
//     setEditingTask(task);
//     setEditTitle(task.title);
//     setEditDate(task.due_date);
//     const modal = new Modal(document.getElementById('editModal'));
// modal.show();

//   };

//   const saveEdit = () => {
//     if (!editTitle.trim() || !editDate) {
//       alert('Both title and date are required!');
//       return;
//     }
//     onEdit(editingTask.id, {
//       title: editTitle,
//       due_date: editDate,
//     });
//     document.getElementById('closeModalBtn').click(); // Close modal
//   };

//   return (
//     <>
//       <ul className="list-group">
//         {tasks.map(task => (
//           <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
//             <div>
//               <strong>{task.title}</strong> <br />
//               <small className={`badge ${task.is_completed ? 'bg-success' : 'bg-warning'}`}>
//                 {task.due_date}
//               </small>
//             </div>
//             <div className="btn-group btn-group-sm">
//               <button
//                 className={`btn ${task.is_completed ? 'btn-secondary' : 'btn-success'} me-1`}
//                 onClick={() => onToggleComplete(task)}
//               >
//                 {task.is_completed ? 'Undo' : 'Done'}
//               </button>
//               <button className="btn btn-primary me-1" onClick={() => startEdit(task)}>✏️</button>
//               <button className="btn btn-danger" onClick={() => onDelete(task.id)}>🗑</button>
//             </div>
//           </li>
//         ))}
//       </ul>

//       {/* Modal */}
//       <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
//         <div className="modal-dialog">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title" id="editModalLabel">Edit Task</h5>
//               <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModalBtn"></button>
//             </div>
//             <div className="modal-body">
//               <input
//                 type="text"
//                 className="form-control mb-2"
//                 value={editTitle}
//                 onChange={(e) => setEditTitle(e.target.value)}
//               />
//               <input
//                 type="date"
//                 className="form-control"
//                 value={editDate}
//                 min={new Date().toISOString().split('T')[0]}  // prevent past date
//                 onChange={(e) => setEditDate(e.target.value)}
//               />
//             </div>
//             <div className="modal-footer">
//               <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
//               <button type="button" className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TaskList;
