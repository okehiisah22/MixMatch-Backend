const User = require("../models/User");

let usersMap = new Map();

const handleError = (error, socket) => {
  socket.emit("error", {
    message: error?.message || "An error occurred",
  });
};

module.exports = {
  goOnline: async (userId, socket) => {
    try {
      if (!usersMap.has(socket.id)) {
        usersMap.set(socket.id, { userId, socketId: socket.id });
        const updatedUser = await User.findByIdAndUpdate(
          { _id: userId },
          { isOnline: true },
          { new: true }
        );
        socket.join(updatedUser._id.toString());
        console.log(
          `${updatedUser._id} is ${updatedUser.isOnline ? "Online" : "Offline"}`
        );
        return;
      }
    } catch (error) {
      handleError(error, socket);
    }
  },
  goOffline: async (socket) => {
    try {
      if (usersMap.has(socket.id)) {
        const user = usersMap.get(socket.id);
        usersMap.delete(socket.id);
        const updatedUser = await User.findByIdAndUpdate(
          { _id: user.userId },
          { isOnline: false },
          { new: true }
        );
        socket.join(updatedUser._id.toString());
        console.log(
          `${updatedUser._id} is ${updatedUser.isOnline ? "Online" : "Offline"}`
        );
        return;
      }
    } catch (error) {
      handleError(error, socket);
    }
  },
  removeSocket: (socket) => {
    if (usersMap.has(socket.id)) {
      usersMap.delete(socket.id);
    }
  },
};
