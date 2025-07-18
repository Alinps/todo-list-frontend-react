import React, { useContext, useEffect, useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AuthForm from './components/AuthForm';
import { AuthContext } from './context/AuthContext';
import api from './api';
import { jsPDF } from "jspdf";
// import EditTaskModal from './components/EditTaskModal'; // import modal

const App = () => {
const { user, logout } = useContext(AuthContext);
const [tasks, setTasks] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('');
const [nextPage, setNextPage] = useState(null);
const [prevPage, setPrevPage] = useState(null);
const [showToast, setShowToast] = useState(false);
// const [editModalVisible, setEditModalVisible] = useState(false);
// const [taskToEdit, setTaskToEdit] = useState(null);



  // const fetchTasks = async () => {
  //   try {
  //     const res = await api.get('tasks/');
  //     setTasks(res.data);
  //   } catch (err) {
  //     console.error('Error fetching tasks:', err);
  //   }
  // };


//   const fetchTasks = async (status = '') => {
//   try {
//     const res = await api.get(`tasks/`, {
//       params: status ? { status } : {}
//     });
//     setTasks(res.data);
//   } catch (err) {
//     console.error('Error fetching tasks:', err.response?.data || err.message);
//   }
// };


// const fetchTasks = async (status = '', search = '') => {
//   try {
//     const res = await api.get('tasks/', {
//       params: {
//         ...(status && { status }),
//         ...(search && { search }),
//       },
//     });
//     setTasks(res.data);
//     setStatusFilter(status);  // so filter buttons keep working
//   } catch (err) {
//     console.error('Error fetching tasks:', err.response?.data || err.message);
//   }
// };

// const fetchTasks = async (status = '', search = '', url = 'tasks/') => {
//   try {
//     const res = await api.get(url, {
//       params: {
//         ...(status && !url.includes('?') && { status }),
//         ...(search && !url.includes('?') && { search }),
//       },
//     });

//     // Update task list from results only
//     setTasks(res.data.results || res.data);  // fallback for no pagination
//     setNextPage(res.data.next);
//     setPrevPage(res.data.previous);
//     setStatusFilter(status);
//   } catch (err) {
//     console.error('Error fetching tasks:', err.response?.data || err.message);
//   }
// };



const fetchTasks = async (status = '', search = '', url = 'tasks/') => {
  try {
    const res = await api.get(url, {
      params: {
        ...(status && !url.includes('?') && { status }),
        ...(search && !url.includes('?') && { search }),
      },
    });

    // Check if paginated response
    if (res.data.results) {
      setTasks(res.data.results);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
    } else {
      setTasks(res.data); // fallback (non-paginated)
      setNextPage(null);
      setPrevPage(null);
    }

    setStatusFilter(status);
  } catch (err) {
    console.error('Error fetching tasks:', err.response?.data || err.message);
  }
};





  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);



  useEffect(() => {
  if (showToast) {
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }
}, [showToast]);



  const toggleComplete = async (task) => {
  try {
    const res = await api.patch(`tasks/${task.id}/`, {
      is_completed: !task.is_completed
    });
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? res.data : t))
    );
  } catch (err) {
    console.error("Toggle error:", err.response?.data || err.message);
  }
};

const deleteTask = async (taskId) => {
  try {
    await api.delete(`tasks/${taskId}/`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
     setShowToast(true); //show toast
  } catch (err) {
    console.error("Delete error:", err.response?.data || err.message);
  }
};



  const addTask = async (task) => {
  try {
    const res = await api.post('tasks/', task);
    setTasks(prev => [res.data, ...prev]);
  } catch (err) {
    console.error('Error adding task:', err.response?.data || err.message);
  }
};

const importTasks = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    const text = e.target.result;
    const lines = text.split('\n').filter(line => line.trim());

    let start = 0;
    if (lines[0].toLowerCase().includes('title')) start = 1;

    for (let i = start; i < lines.length; i++) {
      const line = lines[i].replace(/"/g, ''); // Remove quotes
      const [title, due_date, is_completed] = line.split(',').map(x => x.trim());

      if (!title || !due_date) continue;

      try {
        await api.post('tasks/', {
          title,
          due_date,
          is_completed: is_completed === 'true'
        });
      } catch (err) {
        console.error(`❌ Import error on row ${i + 1}:`, err.response?.data || err.message);
      }
    }

    fetchTasks(); // Update task list
    alert('✅ Tasks imported from CSV!');
  };

  reader.readAsText(file);
};



// const exportTasksAsJSON = () => {
//   const dataStr = JSON.stringify(tasks, null, 2);  // Pretty print with 2-space indent
//   const blob = new Blob([dataStr], { type: "application/json" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "tasks.json";
//   a.click();

//   URL.revokeObjectURL(url); // Clean up
// };



const exportAsJSON = () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, 'tasks.json');
};

const exportAsText = () => {
  const text = tasks.map(t => `${t.title} - ${t.due_date} - ${t.is_completed ? 'Completed' : 'Pending'}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, 'tasks.txt');
};

const exportAsCSV = () => {
  const headers = 'Title,Due Date,Completed\n';
  const rows = tasks.map(t => `"${t.title}","${t.due_date}","${t.is_completed}"`).join('\n');
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, 'tasks.csv');
};

const exportAsPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text('Tasks List', 10, 10);
  tasks.forEach((t, i) => {
    doc.text(`${i + 1}. ${t.title} - ${t.due_date} - ${t.is_completed ? 'Completed' : 'Pending'}`, 10, 20 + i * 10);
  });
  doc.save('tasks.pdf');
};

const exportAsSQL = () => {
  const tableName = "tasks";
  const sqlInsertStatements = tasks.map(task => {
    // Escape single quotes in title to prevent syntax issues
    const safeTitle = task.title.replace(/'/g, "''");
    return `INSERT INTO ${tableName} (title, due_date, is_completed) VALUES ('${safeTitle}', '${task.due_date}', ${task.is_completed ? 1 : 0});`;
  }).join('\n');

  const blob = new Blob([sqlInsertStatements], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, 'tasks.sql');
};


const downloadFile = (url, filename) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};




const editTask = async (id, updatedData) => {

  try {
    const res = await api.patch(`tasks/${id}/`, updatedData);
    setTasks(prev => prev.map(task => (task.id === id ? res.data : task)));
  } catch (err) {
    console.error('Edit error:', err.response?.data || err.message);
  }

};

// const openEditModal = (task) => {      //function to trigger modal
//   setTaskToEdit(task);
//   setEditModalVisible(true);      
// };








  return (
    <div className="container mt-5">
      <h2 className="mb-4">📝 To-Do App</h2>
      {user ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Welcome, {user.username}!</h5>
            <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
          </div>
          <TaskForm onAdd={addTask} />
          {/* <div className="mb-3">
            <button className="btn btn-outline-dark me-2" onClick={() => fetchTasks()}>All</button>
            <button className="btn btn-outline-warning me-2" onClick={() => fetchTasks('pending')}>Pending</button>
            <button className="btn btn-outline-success" onClick={() => fetchTasks('completed')}>Completed</button>
          </div> */}

            <div className="mb-3">
              <button className="btn btn-outline-dark me-2" onClick={() => fetchTasks('', searchTerm)}>All</button>
              <button className="btn btn-outline-warning me-2" onClick={() => fetchTasks('pending', searchTerm)}>Pending</button>
              <button className="btn btn-outline-success" onClick={() => fetchTasks('completed', searchTerm)}>Completed</button>
            </div>


    <div className="mb-3">
        <input
        type="text"
        className="form-control"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => {
        setSearchTerm(e.target.value);
        fetchTasks(statusFilter, e.target.value);
        }}
        />
    </div>


         <TaskList tasks={tasks} onToggleComplete={toggleComplete} onDelete={deleteTask} onEdit={editTask}/>
         {/* <EditTaskModal
            show={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            task={taskToEdit}
            onSave={editTask}
          /> */}

         <div className="dropdown mt-3">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
            📄 Export/Import
            </button>

            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={exportAsJSON}>Export as JSON</button></li>
              <li><button className="dropdown-item" onClick={exportAsText}>Export as Text (TXT)</button></li>
              <li><button className="dropdown-item" onClick={exportAsCSV}>Export as CSV</button></li>
              <li><button className="dropdown-item" onClick={exportAsPDF}>Export as PDF</button></li>
              <li><button className="dropdown-item" onClick={exportAsSQL}>Export as SQL</button></li>
              <li><label className="dropdown-item" htmlFor="import-csv">📥 Import CSV</label></li>
             </ul>
        </div>
        <input
          type="file"
          accept=".csv"
          id="import-csv"
          onChange={importTasks}
          style={{ display: 'none' }}
        />


         <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-outline-primary"
              disabled={!prevPage}
              onClick={() => fetchTasks(statusFilter, searchTerm, prevPage)}
            >
              ← Prev
            </button>
            <button
              className="btn btn-outline-primary"
              disabled={!nextPage}
              onClick={() => fetchTasks(statusFilter, searchTerm, nextPage)}
            >
             Next →
            </button>
        </div>


          {/* <TaskList
  tasks={tasks}
  onToggleComplete={toggleComplete}
  onDelete={deleteTask}
/> */}

        </>
      ) : (
        <AuthForm />
      )}

      <div
  className="toast-container position-fixed bottom-0 end-0 p-3"
  style={{ zIndex: 9999 }}
>
  <div
    className={`toast align-items-center text-bg-danger border-0 ${showToast ? 'show' : ''}`}
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div className="d-flex">
      <div className="toast-body">
        Task deleted successfully!
      </div>
      <button
        type="button"
        className="btn-close btn-close-white me-2 m-auto"
        onClick={() => setShowToast(false)}
      ></button>
    </div>
  </div>
</div>


    </div>

    

  );
};

export default App;
