const { Server } = require("socket.io");
const { frontendUrl } = require("../config/appConfig");

let io;

exports.socketHandler = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: frontendUrl,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
