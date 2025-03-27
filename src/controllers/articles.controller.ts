import { Request, Response } from "express";
import { ArticleService } from "../services/article.service";

export class ArticleController {
  // Create a new article
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
      res.status(500).json({ message: "Error creating article", error });
    }
  }

  // Get all articles
  static async getAllArticles(req: Request, res: Response): Promise<void> {
    try {
      const articles = await ArticleService.getAllArticles();
      res.status(200).json(articles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching articles", error });
    }
  }

  // Get a single article by ID
  static async getArticleById(req: Request, res: Response): Promise<void> {
    try {
      const article = await ArticleService.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json(article);
    } catch (error) {
      res.status(500).json({ message: "Error fetching article", error });
    }
  }

  // Update an article by ID
  static async updateArticleById(req: Request, res: Response): Promise<void> {
    try {
      const updatedArticle = await ArticleService.updateArticleById(
        req.params.id,
        req.body
      );
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Error updating article", error });
    }
  }

  // Delete an article by ID
  static async deleteArticleById(req: Request, res: Response): Promise<void> {
    try {
      const deletedArticle = await ArticleService.deleteArticleById(
        req.params.id
      );
      if (!deletedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting article", error });
    }
  }
}
