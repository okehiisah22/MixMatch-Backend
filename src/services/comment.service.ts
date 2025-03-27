import Comment from '../models/comment.model.ts';

export async function addComment(
  userId: string,
  articleId: string,
  content: string,
  parentCommentId?: string
) {
  return await Comment.create({ userId, articleId, content, parentCommentId });
}

export async function getComments(articleId: string) {
  return await Comment.find({ articleId })
    .sort({ createdAt: -1 })
    .populate('userId')
    .populate('parentCommentId');
}

export async function reportComment(commentId: string) {
  return await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { reports: 1 } },
    { new: true }
  );
}
