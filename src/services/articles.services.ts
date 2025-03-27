import Article, {IArticle} from '../models/article.model';  

export class ArticleService {
  // Create a new article
  static async createArticle(
    title: string,
    content: string,
    author: string
  ): Promise<IArticle> {
    const newArticle = new Article({ title, content, author });
    await newArticle.save();
    return newArticle;
  }

  // Get all articles
  static async getAllArticles(): Promise<IArticle[]> {
    return Article.find();
  }

  // Get an article by ID
  static async getArticleById(id: string): Promise<IArticle | null> {
    return Article.findById(id);
  }

  // Update an article by ID
  static async updateArticleById(
    id: string,
    updateData: Partial<IArticle>
  ): Promise<IArticle | null> {
    return Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Delete an article by ID
  static async deleteArticleById(id: string): Promise<IArticle | null> {
    return Article.findByIdAndDelete(id);
  }

  static async getTrendingTags(): Promise<{ tag: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingTags = await Article.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return trendingTags.map((tag) => ({ tag: tag._id, count: tag.count }));
  }
}
