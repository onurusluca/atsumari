import { io } from "socket.io-client";
const socket = io("https://atsumari-realtime-server.onrender.com/");
export default socket;
