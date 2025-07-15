// import React, { useState } from 'react';

// const TaskForm = ({ onAdd }) => {
//   const [title, setTitle] = useState('');
//   const [dueDate, setDueDate] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!title || !dueDate) {
//       alert("Both title and due date are required.");
//       return;
//     }

//     onAdd({
//       title,
//       due_date: dueDate,
//       is_completed: false,
//     });

//     setTitle('');
//     setDueDate('');
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mb-4">
//       <div className="mb-2">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Task title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//       </div>
//       <div className="mb-2">
//         <input
//           type="date"
//           className="form-control"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//         />
//       </div>
//       <button className="btn btn-success w-100" type="submit">Add Task</button>
//     </form>
//   );
// };

// export default TaskForm;



import React, { useState } from 'react';

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!title.trim() || !dueDate) {
      alert('Both title and due date are required');
      return;
    }

    // Call parent handler
    onAdd({
      title,
      due_date: dueDate,
      is_completed: false,
    });

    // Reset form
    setTitle('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="Task title"
        className="form-control mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        className="form-control mb-2"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}  //prevent past date
      />
      <button type="submit" className="btn btn-primary w-100">Add Task</button>
    </form>
  );
};

export default TaskForm;
