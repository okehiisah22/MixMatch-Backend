import Reaction from '../models/Reaction';

export async function addOrUpdateReaction(
  userId: string,
  articleId: string,
  emoji: string
) {
  return await Reaction.findOneAndUpdate(
    { userId, articleId },
    { emoji },
    { new: true, upsert: true }
  );
}
