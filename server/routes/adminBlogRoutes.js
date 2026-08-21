import express from "express";

import BlogPost from "../models/BlogPost.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL BLOG POSTS
|--------------------------------------------------------------------------
| GET /api/admin/blog
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const posts = await BlogPost.find()
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        posts,
      });
    } catch (error) {
      console.error(
        "Get admin blog posts error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load blog posts.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADMIN — CREATE BLOG POST
|--------------------------------------------------------------------------
| POST /api/admin/blog
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        slug,
        category,
        excerpt,
        content,
        image = "",
        readTime = "",
        status = "draft",
        featured = false,
      } = req.body;

      if (
        !title?.trim() ||
        !category?.trim() ||
        !excerpt?.trim() ||
        !content?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, category, excerpt and content are required.",
        });
      }

      const generatedSlug =
        slug?.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      const existingPost =
        await BlogPost.findOne({
          slug: generatedSlug,
        });

      if (existingPost) {
        return res.status(409).json({
          success: false,
          message:
            "A blog post with this slug already exists.",
        });
      }

      const published =
        status === "published";

      const post = await BlogPost.create({
        title: title.trim(),
        slug: generatedSlug,
        category: category.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        image: image.trim(),
        readTime: readTime.trim(),
        status: published
          ? "published"
          : "draft",
        featured: Boolean(featured),
        publishedAt: published
          ? new Date()
          : null,
      });

      return res.status(201).json({
        success: true,
        message:
          "Blog post created successfully.",
        post,
      });
    } catch (error) {
      console.error(
        "Create admin blog post error:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "A blog post with this slug already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to create blog post.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE BLOG POST
|--------------------------------------------------------------------------
| PUT /api/admin/blog/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        slug,
        category,
        excerpt,
        content,
        image = "",
        readTime = "",
        status = "draft",
        featured = false,
      } = req.body;

      if (
        !title?.trim() ||
        !category?.trim() ||
        !excerpt?.trim() ||
        !content?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, category, excerpt and content are required.",
        });
      }

      const post =
        await BlogPost.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found.",
        });
      }

      const updatedSlug =
        slug?.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      const duplicate =
        await BlogPost.findOne({
          slug: updatedSlug,
          _id: {
            $ne: post._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another blog post already uses this slug.",
        });
      }

      const wasPublished =
        post.status === "published";

      const willBePublished =
        status === "published";

      post.title = title.trim();
      post.slug = updatedSlug;
      post.category = category.trim();
      post.excerpt = excerpt.trim();
      post.content = content.trim();
      post.image = image.trim();
      post.readTime = readTime.trim();
      post.status = willBePublished
        ? "published"
        : "draft";
      post.featured = Boolean(featured);

      if (
        willBePublished &&
        !wasPublished
      ) {
        post.publishedAt = new Date();
      }

      if (!willBePublished) {
        post.publishedAt = null;
      }

      await post.save();

      return res.json({
        success: true,
        message:
          "Blog post updated successfully.",
        post,
      });
    } catch (error) {
      console.error(
        "Update admin blog post error:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "A blog post with this slug already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to update blog post.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADMIN — DELETE BLOG POST
|--------------------------------------------------------------------------
| DELETE /api/admin/blog/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const post =
        await BlogPost.findByIdAndDelete(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Blog post deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete admin blog post error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete blog post.",
      });
    }
  }
);

export default router;