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

    // Join a room for specific order tracking
    socket.on("join-order", (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order-${orderId}`);
    });

    // Leave order room
    socket.on("leave-order", (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`Socket ${socket.id} left order room: order-${orderId}`);
    });

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

// Emit order status update
exports.emitOrderUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order-${orderId}`).emit("order-updated", orderData);
    console.log(`Emitted order update for order-${orderId}`);
  }
};
