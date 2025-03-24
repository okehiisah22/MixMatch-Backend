import type { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import logger from "../config/logger"
import { User } from "../models/user.model"

/**
 * Get current user profile
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    // User is already attached to req by the authenticate middleware
    return res.status(200).json({
      success: true,
      data: req.user,
    })
  } catch (error) {
    logger.error("Error in getCurrentUser controller:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    })
  }
})

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, profilePicture } = req.body

    // Only allow updating specific fields
    const updateData: any = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (phone) updateData.phone = phone
    if (profilePicture) updateData.profilePicture = profilePicture

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    })
  } catch (error) {
    logger.error("Error in updateProfile controller:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    })
  }
})

