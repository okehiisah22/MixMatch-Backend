import Message, { MessageInterface } from "../models/message.model";
import { User } from "../models/user.model";

export const createMessage = async (dto: MessageInterface) => {
  const user = await User.findById(dto.senderId);
  if (!user) {
    return {
      message: "User not found",
    };
  }
  const message = await Message.create(dto);

  return message;
};

export const getAllMessages = async () => {
  const message = await Message.find();
  if (!message || message.length === 0) {
    return [];
  }
  return {
    totalcount: message.length,
    data: message
  };
};

export const getMessageById = async (id: string) => {
  const message = await Message.findById(id);
  if (!message) {
    return {
      message: "Message not found",
    };
  }
  return message;
};

export const updateMessage = async (id: string, text: string) => {
  const updateMessage = await Message.findByIdAndUpdate(
    id,
    { text },
    { new: true }
  );
  return updateMessage;
};

export const deleteMessage = async (id: string) => {
  await Message.findByIdAndDelete(id);
  return {
    message: " Message deleted",
  };
};
