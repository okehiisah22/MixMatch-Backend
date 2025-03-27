import express from "express";
import { MessageController } from "../controllers/message.controller";
import authRouter from "./auth.routes";

const messageRouter = (router: express.Router) => {
  router.use(express.json());
  router.post("/messages", async (req, res) => {
    await MessageController.createMessage(req, res);
  });

  router.get("/messages", async (req, res) => {
    await MessageController.getAllMessages(req, res);
  });

  router.get("/messages/:id", async (req, res) => {
    await MessageController.getMessageById(req, res);
  });

  router.patch("/messages/:id", async (req, res) => {
    await MessageController.updateMessage(req, res);
  });

  router.delete("/messages/:id", async (req, res) => {
    await MessageController.deleteMessage(req, res);
  });
};

export default messageRouter;
