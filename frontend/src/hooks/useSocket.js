import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNotifications } from "../context/NotificationContext";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

export function useSocket(userId) {

  const socketRef = useRef(null);
  const { addNotification } = useNotifications();

  useEffect(() => {

    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    socketRef.current = io(WS_URL, {
      auth: { token },
      query: { authToken: token }
    });

    const socket = socketRef.current;

    socket.emit("join", userId);

    socket.on("notification", (data) => {
      console.log("Notification received:", data);
      addNotification(data);
    });

    return () => {
      socket.disconnect();
    };

  }, [userId]);

}