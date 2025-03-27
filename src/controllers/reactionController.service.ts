import { Request, Response } from 'express';
import { addOrUpdateReaction } from '../services/reactionService';

export async function reactToArticle(req: Request, res: Response) {
  try {
    const { id: articleId } = req.params;
    const { emoji } = req.body;
    const userId = (req as any).user.id; // Assuming user is authenticated

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const reaction = await addOrUpdateReaction(userId, articleId, emoji);
    res.json(reaction);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: (error as Error).message,
    });
  }
}
