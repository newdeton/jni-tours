import express from "express";
import BlogPost from "../models/BlogPost.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC — GET ALL PUBLISHED BLOG POSTS
|--------------------------------------------------------------------------
| GET /api/blog
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find({
      status: "published",
    })
      .sort({
        publishedAt: -1,
        createdAt: -1,
      })
      .lean();

    return res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(
      "Get public blog posts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load blog posts.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| PUBLIC — GET SINGLE PUBLISHED BLOG POST
|--------------------------------------------------------------------------
| GET /api/blog/:slug
|--------------------------------------------------------------------------
*/

router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: "published",
    }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    return res.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error(
      "Get public blog post error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load blog post.",
    });
  }
});

export default router;