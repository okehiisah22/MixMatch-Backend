import express, { Request, Response, NextFunction } from "express";
import {
	createReview,
	getReviews,
	getReviewById,
	updateReview,
	deleteReview,
} from "../services/review.service";

const router = express.Router();

// Wrapper function to handle async route handlers
const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

router.post(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const review = await createReview(req.body);
		return res.status(201).json(review);
	})
);

router.get(
	"/",
	asyncHandler(async (_req: Request, res: Response) => {
		const reviews = await getReviews();
		return res.json(reviews);
	})
);

router.get(
	"/:id",
	asyncHandler(async (req: Request, res: Response) => {
		const review = await getReviewById(req.params.id);
		if (!review)
			return res.status(404).json({ message: "Review not found" });
		return res.json(review);
	})
);

router.put(
	"/:id",
	asyncHandler(async (req: Request, res: Response) => {
		const updatedReview = await updateReview(req.params.id, req.body);
		if (!updatedReview)
			return res.status(404).json({ message: "Review not found" });
		return res.json(updatedReview);
	})
);

router.delete(
	"/:id",
	asyncHandler(async (req: Request, res: Response) => {
		const deletedReview = await deleteReview(req.params.id);
		if (!deletedReview)
			return res.status(404).json({ message: "Review not found" });
		return res.json({ message: "Review deleted successfully" });
	})
);

export default router;
