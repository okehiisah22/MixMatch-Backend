import { Request, Response } from "express";
import { Create_DJProfile } from "../services/DjProfile.service";

export const Create_DJProfileHandler = async (req: Request, res: Response) => {
  try {
    const { userId, bio, genres, equipment, pricing, portfolio } = req.body;

    const Dj_Profile = await Create_DJProfile(
      userId,
      bio,
      genres,
      equipment,
      pricing,
      portfolio
    );

    res.status(201).json({ success: true, profile: Dj_Profile });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
