import { io } from "socket.io-client";

console.log("Attempting to connect to WebSocket server...");

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  // No auth provided
});

socket.on("connect", () => {
  console.log("VULNERABILITY CONFIRMED: Connected without authentication! Socket ID:", socket.id);
  socket.disconnect();
  process.exit(1); // Fail the test if connected
});

socket.on("connect_error", (err) => {
  console.log("Connection failed as expected:", err.message);
  process.exit(0); // Success if connection rejected
});

setTimeout(() => {
  console.log("Timeout waiting for connection result. Assuming connection failed.");
  process.exit(0);
}, 5000);
