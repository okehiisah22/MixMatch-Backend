import mongoose, { Document, Schema } from 'mongoose';

interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  articleId: mongoose.Types.ObjectId;
  content: string;
  parentCommentId?: mongoose.Types.ObjectId;
  reports: number;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    content: { type: String, required: true },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    reports: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;
