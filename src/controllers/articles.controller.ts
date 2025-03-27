import { Request, Response } from 'express';
import { ArticleService } from '../services/articles.services';

export class ArticleController {
  static async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, author } = req.body;
      const newArticle = await ArticleService.createArticle(
        title,
        content,
        author
      );
      res.status(201).json(newArticle);
    } catch (error) {
      res.status(500).json({ message: 'Error creating article', error });
    }
  }

  static async getAllArticles(req: Request, res: Response): Promise<void> {
    try {
      const articles = await ArticleService.getAllArticles();
      res.status(200).json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching articles', error });
    }
  }

  static async getArticleById(req: Request, res: Response): Promise<void> {
    try {
      const article = await ArticleService.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      res.status(200).json(article);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching article', error });
    }
  }

  static async updateArticleById(req: Request, res: Response): Promise<void> {
    try {
      const updatedArticle = await ArticleService.updateArticleById(
        req.params.id,
        req.body
      );
      if (!updatedArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }
      res.status(200).json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: 'Error updating article', error });
    }
  }

  static async deleteArticleById(req: Request, res: Response): Promise<void> {
    try {
      const deletedArticle = await ArticleService.deleteArticleById(
        req.params.id
      );
      if (!deletedArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }
      res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting article', error });
    }
  }

  static async searchArticles(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res
          .status(400)
          .json({ message: "Query parameter 'q' is required" });
      }

      const articles = await ArticleService.searchArticles(q);
      res.status(200).json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Error searching articles', error });
    }
  }

  static async getTrendingTags(req: Request, res: Response): Promise<void> {
    try {
      const trendingTags = await ArticleService.getTrendingTags();
      res.status(200).json(trendingTags);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching trending tags', error });
    }
  }
}
