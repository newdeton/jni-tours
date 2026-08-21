import express from "express";

import Destination from "../models/Destination.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
| GET /api/destinations
|
| Returns only published admin-created destinations.
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find({
      isPublished: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      destinations,
    });
  } catch (error) {
    console.error(
      "[DESTINATIONS] Load error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load destinations.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE PUBLIC DESTINATION
|--------------------------------------------------------------------------
| GET /api/destinations/:id
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res) => {
  try {
    const destination =
      await Destination.findOne({
        _id: req.params.id,
        isPublished: true,
      }).lean();

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    return res.status(200).json({
      success: true,
      destination,
    });
  } catch (error) {
    console.error(
      "[DESTINATIONS] Details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load destination.",
    });
  }
});

export default router;