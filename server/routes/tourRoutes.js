import express from "express";
import Tour from "../models/Tour.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| JNI TOURS — PUBLIC TOUR ROUTES
|--------------------------------------------------------------------------
|
| Base URL:
| /api/tours
|
| These routes are PUBLIC.
| Only published tours are returned.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET ALL PUBLISHED TOURS
|--------------------------------------------------------------------------
| GET /api/tours
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      destination,
      category,
      style,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {
      status: "published",
    };

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { title: searchRegex },
        { destination: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
        { style: searchRegex },
        { overview: searchRegex },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | DESTINATION
    |--------------------------------------------------------------------------
    */

    if (
      typeof destination === "string" &&
      destination.trim() &&
      destination !== "all"
    ) {
      filter.destination = new RegExp(
        destination.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    if (
      typeof category === "string" &&
      category.trim() &&
      category !== "all"
    ) {
      filter.category = category.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | STYLE
    |--------------------------------------------------------------------------
    */

    if (
      typeof style === "string" &&
      style.trim() &&
      style !== "all"
    ) {
      filter.style = style.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE RANGE
    |--------------------------------------------------------------------------
    */

    if (minPrice !== undefined && minPrice !== "") {
      const minimum = Number(minPrice);

      if (Number.isFinite(minimum) && minimum >= 0) {
        filter.price = {
          ...(filter.price || {}),
          $gte: minimum,
        };
      }
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      const maximum = Number(maxPrice);

      if (Number.isFinite(maximum) && maximum >= 0) {
        filter.price = {
          ...(filter.price || {}),
          $lte: maximum,
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY DATABASE
    |--------------------------------------------------------------------------
    */

    const tours = await Tour.find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: tours.length,
      tours,
    });
  } catch (error) {
    console.error("[PUBLIC] Tours error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load tours.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE PUBLISHED TOUR
|--------------------------------------------------------------------------
| GET /api/tours/:slug
|--------------------------------------------------------------------------
*/

router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Tour slug is required.",
      });
    }

    const tour = await Tour.findOne({
      slug,
      status: "published",
    }).lean();

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found.",
      });
    }

    return res.status(200).json({
      success: true,
      tour,
    });
  } catch (error) {
    console.error("[PUBLIC] Tour details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load tour.",
    });
  }
});

export default router;