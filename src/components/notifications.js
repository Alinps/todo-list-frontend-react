// // notifications.js
// export async function showDueTomorrowNotifications() {
//   try {
//     // Step 1: Ask for permission
//     if (Notification.permission !== "granted") {
//       await Notification.requestPermission();
//     }

//     // Step 2: Fetch tasks due tomorrow
//     const response = await fetch("http://127.0.0.1:8000/api/tasks/due-tomorrow/");
//     const tasks = await response.json();
    
//     console.log("Tasks from backend:", tasks);

//     // Step 3: Show notifications
//     tasks.forEach(task => {
//       new Notification("Task Reminder", {
//         body: `Tomorrow: ${task.title}`,
//         icon: "/icon.png" // optional
//       });
//     });
//   } catch (err) {
//     console.error("Notification error:", err);
//   }
// }
// notifications.js
export async function showDueTomorrowNotifications() {
  try {
    // Step 1: Ask for permission
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    // Step 2: Fetch tasks due tomorrow with auth
    const token = localStorage.getItem("token"); // token saved on login
    const response = await fetch("http://127.0.0.1:8000/api/tasks/due-tomorrow/", {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tasks = await response.json();
    console.log("Tasks from backend:", tasks);

    // Step 3: Show notifications
    tasks.forEach(task => {
      new Notification("Task Reminder", {
        body: `Tomorrow: ${task.title}`,
        icon: "/icon.png", // optional
      });
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
}
