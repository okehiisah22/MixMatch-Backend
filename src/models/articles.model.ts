import mongoose, { Document, Schema } from 'mongoose';

// Step 1: Define the Article interface
export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// Step 2: Define the Mongoose schema
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Step 3: Create the model from the schema
const Article = mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;
