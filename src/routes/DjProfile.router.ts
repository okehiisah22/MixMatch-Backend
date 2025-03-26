import express, { Router } from "express";
import { Create_DJProfileHandler } from "../controllers/DjProfile.controller";

const djProfile_Router = (router: express.Router) => {
  router.post("/djs", Create_DJProfileHandler);
};

export default djProfile_Router;
