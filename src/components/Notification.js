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
