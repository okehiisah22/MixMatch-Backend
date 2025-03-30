import express from 'express';
import reportController from '../controllers/reportController';

const router = express.Router();

router.get('/', reportController.getReports);
router.patch('/:id/reviewed', reportController.markAsReviewed);

export default router;
