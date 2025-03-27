import ReviewModel from "../models/review.model";

export const createReview = async (data: any) => {
	return await ReviewModel.create(data);
};

export const getReviews = async () => {
	return await ReviewModel.find().populate("user").populate("product");
};

export const getReviewById = async (id: string) => {
	return await ReviewModel.findById(id);
};

export const updateReview = async (id: string, data: any) => {
	return await ReviewModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReview = async (id: string) => {
	return await ReviewModel.findByIdAndDelete(id);
};
