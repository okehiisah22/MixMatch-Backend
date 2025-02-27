const { Server: socket } = require("socket.io");
const http = require("http");
const messageEvents = require("./messageEvents");
const dotenv = require("dotenv");
const socketEvents = require("./socketEvents");

dotenv.config();

const socketServer = (app) => {
  const URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.BASE_URL;
  const server = http.createServer(app);
  const io = new socket(server, {
    cors: {
      origin: URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    app.set("socket", socket);
    socket.on("goOnline", async (userId) => {
      socketEvents.goOnline(userId, socket);
    });

    socket.on("send_message", async (data) => {
      messageEvents.sendMessage(data, socket);
    });

    socket.on("read_message", async (data) => {
      messageEvents.readMessage(data, socket);
    });

    socket.on("join", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("disconnect", async () => {
      socketEvents.goOffline(socket);
      socketEvents.removeSocket(socket);
      socket.disconnect();
    });
  });

  app.set("IO", io);
  return server;
};

module.exports = socketServer;
