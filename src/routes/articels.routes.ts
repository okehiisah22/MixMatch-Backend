import { Router } from 'express';
import { ArticleController } from '../controllers/articles.controller';

const router = Router();

// Routes for articles
router.post('/articles', ArticleController.createArticle); // Create a new article
router.get('/articles', ArticleController.getAllArticles); // Get all articles
router.get('/search', ArticleController.searchArticles);
router.get('/trending', ArticleController.getTrendingTags);
router.get('/articles/:id', ArticleController.getArticleById); // Get a single article by ID
router.put('/articles/:id', ArticleController.updateArticleById); // Update an article by ID
router.delete('/articles/:id', ArticleController.deleteArticleById); // Delete an article by ID


export default router;
