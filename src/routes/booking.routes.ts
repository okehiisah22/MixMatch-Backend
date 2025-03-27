import { Router, Request, Response } from "express";
import { BookingController } from "../controllers/booking.controller";

const router = Router();
const bookingController = new BookingController();

// Create a new booking
router.post("/", async (req: Request, res: Response) => {
  await bookingController.createBooking(req, res);
});

// Get all bookings with optional filters
router.get("/", async (req: Request, res: Response) => {
  await bookingController.getAllBookings(req, res);
});

// Get a single booking by ID
router.get("/:id", async (req: Request, res: Response) => {
  await bookingController.getBookingById(req, res);
});

// Update a booking
router.put("/:id", async (req: Request, res: Response) => {
  await bookingController.updateBooking(req, res);
});

// Delete a booking
router.delete("/:id", async (req: Request, res: Response) => {
  await bookingController.deleteBooking(req, res);
});

// Get bookings by user ID
router.get("/user/:userId", async (req: Request, res: Response) => {
  await bookingController.getBookingsByUserId(req, res);
});

// Get bookings by DJ ID
router.get("/dj/:djId", async (req: Request, res: Response) => {
  await bookingController.getBookingsByDjId(req, res);
});

export default router;
