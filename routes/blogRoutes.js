const { Router } = require('express');
const blogController = require('../controllers/blogController');

const auth = require('../middleware/auth');

const router = Router();

router
  .route('/')
  .get(blogController.getAllBlog)
  .post(auth, blogController.createBlog);

router.route('/related/:id/:category').get(blogController.relatedBlog);

router
  .route('/:id')
  .get(blogController.getBlog)
  .put(auth, blogController.updateBlog)
  .delete(auth, blogController.deleteBlog);

module.exports = router;
