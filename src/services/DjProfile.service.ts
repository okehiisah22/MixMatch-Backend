import { DJProfile } from "../models/DjProfile.model";
import { User, UserRole } from "../models/user.model";

export const Create_DJProfile = async (
  userId: string,
  bio: string,
  genres: string[],
  equipment: string,
  pricing: string,
  portfolio: string[]
) => {
  const user = await User.findById(userId);
  if (!user || user.role !== UserRole.DJ) {
    throw new Error("Only_DJ_can_create_profiles");
  }

  const existingProfile = await DJProfile.findOne({ user: userId });
  if (existingProfile) {
    throw new Error("Profile_already_exists");
  }

  return await DJProfile.create({
    user: userId,
    bio,
    genres,
    equipment,
    pricing,
    portfolio,
  });
};
