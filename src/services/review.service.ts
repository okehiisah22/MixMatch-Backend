import { Review } from "../models/review.model";

export const createReview = async (data: any) => {
	return await Review.create(data);
};

export const getReviews = async () => {
	return await Review.find().populate("user").populate("product");
};

export const getReviewById = async (id: string) => {
	return await Review.findById(id);
};

export const updateReview = async (id: string, data: any) => {
	return await Review.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReview = async (id: string) => {
	return await Review.findByIdAndDelete(id);
};
