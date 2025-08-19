import { Server } from "http";
import app from "./app";
import config from "./config";
import seedSuperAdmin from "./app/seedSuperAdmin";
import WebSocketService from "./app/websocket/websocket";

const port = 5015; // Force port to 5015

async function main() {
  const server: Server = app.listen(port, () => {
    console.log("Server is running on port ", port);
  });
  
  await seedSuperAdmin();

  // Initialize WebSocket service for real-time chat
  const webSocketService = new WebSocketService(server);
  console.log("WebSocket server initialized for real-time chat");

  // Make WebSocket service available globally
  (global as any).webSocketService = webSocketService;
  (global as any).wsService = webSocketService;
}

main();

// 
