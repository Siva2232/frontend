import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "https://webbackend-oy71.onrender.com";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const subscribeToProducts = (callback) => {
  getSocket().on("products_updated", callback);
};

export const unsubscribeFromProducts = () => {
  getSocket().off("products_updated");
};

export const subscribeToRegistrations = (callback) => {
  getSocket().on("registrations_updated", callback);
};

export const unsubscribeFromRegistrations = () => {
  getSocket().off("registrations_updated");
};

export const subscribeToServices = (callback) => {
  getSocket().on("services_updated", callback);
};

export const unsubscribeFromServices = () => {
  getSocket().off("services_updated");
};

export const subscribeToNotifications = (callback) => {
  getSocket().on("notifications_updated", callback);
};

export const unsubscribeFromNotifications = () => {
  getSocket().off("notifications_updated");
};
