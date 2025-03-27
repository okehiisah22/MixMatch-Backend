import { Request, Response } from "express";
import mongoose from "mongoose";
import * as messageService from "../services/message.service";

const MessageController = {
  createMessage: async (req: Request, res: Response) => {
    try {
      const message = await messageService.createMessage(req.body);
      return res.status(201).json({
        success: true,
        message: "Message created",
        data: message,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  getAllMessages: async (req: Request, res: Response) => {
    try {
      const messages = await messageService.getAllMessages();
      return res.status(200).json({
        success: true,
        message: "Messages retrieved",
        data: messages,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  getMessageById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const message = await messageService.getMessageById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Message retrieved",
        data: message,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  updateMessage: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const updatedMessage = await messageService.updateMessage(id, req.body);
      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Message updated",
        data: updatedMessage,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  deleteMessage: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const deletedMessage = await messageService.deleteMessage(id);
      if (!deletedMessage) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Message deleted",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },
};

export { MessageController };
