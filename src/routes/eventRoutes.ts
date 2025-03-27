import express, { RequestHandler } from "express";
import { EventController } from "../controllers/eventController";

const router = express.Router();
const eventController = new EventController();

// Create a new event
router.post("/", eventController.createEvent as RequestHandler);

// Get all events with optional filtering and pagination
router.get("/", eventController.getAllEvents as RequestHandler);

// Get a single event by ID
router.get("/:id", eventController.getEventById as RequestHandler);

// Update an event
router.put("/:id", eventController.updateEvent as RequestHandler);

// Delete an event
router.delete("/:id", eventController.deleteEvent as RequestHandler);

export default router;
