import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, "Title can't exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create a full-text index on title, content, and tags
ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Article = mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;
