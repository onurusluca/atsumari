/* import { io, Socket } from "socket.io-client";
import { EnvVariables } from "@/envVariables";

let socket: Socket; // Keep socket as a variable accessible within the module.

// Export a function to setup the socket and join a room.
export function joinRoom(spaceId: string) {
  socket = io(EnvVariables.realtimeApiUrl);
  socket.on("connect", () => {
    socket.emit("joinRoom", spaceId);
  });
}

// Also export a function to get the current socket.
export function getSocket(): Socket {
  if (!socket) {
    throw new Error("Must join a room before getting the socket.");
  }
  return socket;
}
 */

import { io } from "socket.io-client";
import { EnvVariables } from "@/envVariables";

const socket = io(EnvVariables.realtimeApiUrl);
export default socket;
