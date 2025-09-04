
// notifications.js
// import { toast } from "react-toastify";
// export async function showDueTomorrowNotifications() {
//   try {
    // Step 1: Ask for permission
    // if (Notification.permission !== "granted") {
    //   await Notification.requestPermission();
    // }
    // // Step 2: Fetch tasks due tomorrow with auth
    // const token = localStorage.getItem("token"); // token saved on login
    // const response = await fetch("http://127.0.0.1:8000/api/tasks/due-tomorrow/", {
    //   headers: {
    //     "Authorization": `Token ${token}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! Status: ${response.status}`);
    // }

    // const tasks = await response.json();
    // console.log("Tasks from backend:", tasks);

    // // Step 3: Show notifications
    // tasks.forEach(task => {
    //   new Notification("Task Reminder", {
    //     body: `Tomorrow: ${task.title}`,
    //     icon: "/icon.png", // optional
    //   });
    // });

//   } catch (err) {
//     console.error("Error fetching notifications:", err);
//   }
// }

// src/components/Notifications.js
import { useEffect } from "react";
import { toast } from "react-toastify";

function Notifications() {
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        data.forEach((notif) => {
          // 1. Show Toast notification
          toast.info(notif.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          // 2. Show Browser notification
          if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
              body: notif.message,
              icon: "/logo192.png", // optional: your app logo
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Task Reminder", {
                  body: notif.message,
                  icon: "/logo192.png",
                });
              }
            });
          }

          // 3. Mark notification as read in backend
          fetch(`http://127.0.0.1:8000/api/notifications/${notif.id}/read/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          });
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Poll every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  return null; // Component doesn't render visible UI
}

export default Notifications;
