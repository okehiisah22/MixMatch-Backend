const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');
const { validatePortfolio } = require('../middleware/validation');

// Gallery Routes
router.post('/galleries', auth, validatePortfolio.createGallery, portfolioController.createGallery);
router.post('/galleries/:galleryId/media', auth, portfolioController.addGalleryMedia);
router.get('/djs/:djId/galleries', portfolioController.getDJGalleries);

// Testimonial Routes
router.post('/testimonials', auth, validatePortfolio.createTestimonial, portfolioController.createTestimonial);
router.put('/testimonials/:id/moderate', auth, portfolioController.moderateTestimonial);

// Analytics Routes
router.post('/:djId/interactions', portfolioController.trackInteraction);
router.get('/:djId/analytics', auth, portfolioController.getPortfolioAnalytics);

module.exports = router;