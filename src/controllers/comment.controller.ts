import { Request, Response } from 'express';
import {
  addComment,
  getComments,
  reportComment,
} from '../services/commentService';

export async function postComment(req: Request, res: Response) {
  try {
    const { id: articleId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = (req as any).user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await addComment(
      userId,
      articleId,
      content,
      parentCommentId
    );
    res.json(comment);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Internal server error',
        error: (error as Error).message,
      });
  }
}

export async function fetchComments(req: Request, res: Response) {
  try {
    const { id: articleId } = req.params;
    const comments = await getComments(articleId);
    res.json(comments);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Internal server error',
        error: (error as Error).message,
      });
  }
}

export async function reportCommentHandler(req: Request, res: Response) {
  try {
    const { id: commentId } = req.params;
    const updatedComment = await reportComment(commentId);
    res.json(updatedComment);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Internal server error',
        error: (error as Error).message,
      });
  }
}
