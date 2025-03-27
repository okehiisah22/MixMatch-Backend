import mongoose, { Document, Schema } from 'mongoose';

interface IReaction extends Document {
  userId: mongoose.Types.ObjectId;
  articleId: mongoose.Types.ObjectId;
  emoji: string;
}

const ReactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

ReactionSchema.index({ userId: 1, articleId: 1 }, { unique: true });

const Reaction = mongoose.model<IReaction>('Reaction', ReactionSchema);
export default Reaction;
