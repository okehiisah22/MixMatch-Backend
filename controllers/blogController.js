const catchAsync = require('../helpers/catchAsync');
const Blog = require('../models/Blog');

const BlogController = {
  createBlog: catchAsync(async (req, res, next) => {
    try {
      const blog = new Blog(req.body);
      await blog.save();
      res.status(201).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }),

  getAllBlog: catchAsync(async (req, res, next) => {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }),

  getBlog: catchAsync(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
        });
      }

      res.status(200).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }),

  updateBlog: catchAsync(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
        });
      }

      Object.assign(blog, req.body);
      await blog.save();

      res.status(200).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }),

  deleteBlog: catchAsync(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
        });
      }

      await Blog.findByIdAndDelete(blog._id);

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }),

  relatedBlog: catchAsync(async (req, res, next) => {
    try {
      const { id, category } = req.params;
      console.log(id, category);
      const relatedBlogs = await Blog.find({
        category,
        _id: { $ne: id },
      })
        .sort({ createdAt: -1 })
        .limit(4);

      res.status(200).json({
        success: true,
        count: relatedBlogs.length,
        data: relatedBlogs,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }),
};

module.exports = BlogController;
