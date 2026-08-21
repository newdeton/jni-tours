import express from "express";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";

import Destination from "../models/Destination.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| JNI TOURS — ADMIN ROUTES
|--------------------------------------------------------------------------
|
| Base URL:
| /api/admin
|
| Protected by:
| 1. Valid JWT
| 2. Existing active user
| 3. role === "admin"
|
|--------------------------------------------------------------------------
*/

router.use(requireAuth);
router.use(requireAdmin);

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
];

const TOUR_STATUSES = [
  "draft",
  "published",
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function parsePagination(page, limit) {
  const pageNumber = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 20,
      1
    ),
    100
  );

  return {
    pageNumber,
    limitNumber,
    skip:
      (pageNumber - 1) *
      limitNumber,
  };
}

function buildPagination(
  total,
  page,
  limit
) {
  return {
    total,
    page,
    limit,
    pages:
      total === 0
        ? 1
        : Math.ceil(total / limit),
    hasNextPage:
      page * limit < total,
    hasPreviousPage:
      page > 1,
  };
}

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      typeof item === "string"
        ? item.trim()
        : ""
    )
    .filter(Boolean);
}

function cleanItinerary(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => ({
      day:
        cleanString(item?.day) ||
        `Day ${index + 1}`,

      title:
        cleanString(item?.title),

      description:
        cleanString(
          item?.description
        ),
    }))
    .filter(
      (item) =>
        item.title ||
        item.description
    );
}

/*
|--------------------------------------------------------------------------
| BUILD TOUR PAYLOAD
|--------------------------------------------------------------------------
*/

function buildTourPayload(body = {}) {
  const title = cleanString(
    body.title
  );

  const destination =
    cleanString(
      body.destination
    );

  const slug =
    normalizeSlug(
      body.slug || title
    );

  const price = Number(
    body.price
  );

  const rating =
    body.rating === undefined ||
    body.rating === ""
      ? 5
      : Number(body.rating);

  const reviews =
    body.reviews === undefined ||
    body.reviews === ""
      ? 0
      : Number(body.reviews);

  return {
    title,

    slug,

    destination,

    location:
      cleanString(
        body.location
      ),

    category:
      cleanString(
        body.category
      ) ||
      "Wildlife Safari",

    style:
      cleanString(
        body.style
      ) || "Comfort",

    duration:
      cleanString(
        body.duration
      ),

    price,

    rating,

    reviews,

    guests:
      cleanString(
        body.guests
      ) || "2–6 guests",

    bestTime:
      cleanString(
        body.bestTime
      ),

    badge:
      cleanString(
        body.badge
      ),

    images:
      cleanStringArray(
        body.images
      ),

    overview:
      cleanString(
        body.overview
      ),

    highlights:
      cleanStringArray(
        body.highlights
      ),

    included:
      cleanStringArray(
        body.included
      ),

    excluded:
      cleanStringArray(
        body.excluded
      ),

    itinerary:
      cleanItinerary(
        body.itinerary
      ),

    accommodation:
      cleanString(
        body.accommodation
      ),

    notes:
      cleanString(
        body.notes
      ),

    status:
      TOUR_STATUSES.includes(
        body.status
      )
        ? body.status
        : "published",
  };
}

/*
|--------------------------------------------------------------------------
| ADMIN HEALTH CHECK
|--------------------------------------------------------------------------
| GET /api/admin
|--------------------------------------------------------------------------
*/

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    admin: true,

    message:
      "JNI Tours admin API is running.",

    user: {
      id: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

/*
|--------------------------------------------------------------------------
| DASHBOARD STATISTICS
|--------------------------------------------------------------------------
| GET /api/admin/stats
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  async (req, res) => {
    try {
      const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        unpaidBookings,
        pendingPayments,
        paidBookings,
        failedPayments,
        refundedPayments,
        totalCustomers,
        activeCustomers,
        totalTours,
        publishedTours,
        draftTours,
      ] = await Promise.all([
        Booking.countDocuments(),

        Booking.countDocuments({
          status: "pending",
        }),

        Booking.countDocuments({
          status: "confirmed",
        }),

        Booking.countDocuments({
          status: "completed",
        }),

        Booking.countDocuments({
          status: "cancelled",
        }),

        Booking.countDocuments({
          paymentStatus: "unpaid",
        }),

        Booking.countDocuments({
          paymentStatus: "pending",
        }),

        Booking.countDocuments({
          paymentStatus: "paid",
        }),

        Booking.countDocuments({
          paymentStatus: "failed",
        }),

        Booking.countDocuments({
          paymentStatus: "refunded",
        }),

        User.countDocuments({
          role: "customer",
        }),

        User.countDocuments({
          role: "customer",
          isActive: true,
        }),

        Tour.countDocuments(),

        Tour.countDocuments({
          status: "published",
        }),

        Tour.countDocuments({
          status: "draft",
        }),
      ]);

      const [
        revenueResult,
        upcomingBookings,
      ] = await Promise.all([
        Booking.aggregate([
          {
            $match: {
              paymentStatus: "paid",
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: {
                  $ifNull: [
                    "$pricing.total",
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Booking.countDocuments({
          status: {
            $in: [
              "pending",
              "confirmed",
            ],
          },
        }),
      ]);

      const revenue =
        revenueResult.length
          ? Number(
              revenueResult[0].total ||
                0
            )
          : 0;

      return res.status(200).json({
        success: true,

        stats: {
          bookings: {
            total: totalBookings,
            pending: pendingBookings,
            confirmed:
              confirmedBookings,
            completed:
              completedBookings,
            cancelled:
              cancelledBookings,
            upcoming:
              upcomingBookings,
          },

          payments: {
            unpaid:
              unpaidBookings,
            pending:
              pendingPayments,
            paid:
              paidBookings,
            failed:
              failedPayments,
            refunded:
              refundedPayments,
            revenue,
            currency: "USD",
          },

          customers: {
            total:
              totalCustomers,
            active:
              activeCustomers,
          },

          tours: {
            total: totalTours,
            published:
              publishedTours,
            draft: draftTours,
          },
        },
      });
    } catch (error) {
      console.error(
        "[ADMIN] Stats error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load admin statistics.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| TOUR MANAGEMENT
|--------------------------------------------------------------------------
|
| These routes connect AdminTours.jsx to MongoDB.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET ALL ADMIN TOURS
|--------------------------------------------------------------------------
| GET /api/admin/tours
|--------------------------------------------------------------------------
*/

router.get(
  "/tours",
  async (req, res) => {
    try {
      const {
        status,
        category,
        destination,
        search = "",
        page = 1,
        limit = 100,
      } = req.query;

      const {
        pageNumber,
        limitNumber,
        skip,
      } = parsePagination(
        page,
        limit
      );

      const filter = {};

      /*
      |----------------------------------------------------------------------
      | STATUS FILTER
      |----------------------------------------------------------------------
      */

      if (
        status &&
        status !== "all"
      ) {
        const normalizedStatus =
          String(status)
            .trim()
            .toLowerCase();

        if (
          !TOUR_STATUSES.includes(
            normalizedStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid tour status.",
          });
        }

        filter.status =
          normalizedStatus;
      }

      /*
      |----------------------------------------------------------------------
      | CATEGORY
      |----------------------------------------------------------------------
      */

      if (
        category &&
        category !== "all"
      ) {
        filter.category =
          String(category).trim();
      }

      /*
      |----------------------------------------------------------------------
      | DESTINATION
      |----------------------------------------------------------------------
      */

      if (
        destination &&
        destination !== "all"
      ) {
        filter.destination =
          String(
            destination
          ).trim();
      }

      /*
      |----------------------------------------------------------------------
      | SEARCH
      |----------------------------------------------------------------------
      */

      if (
        typeof search === "string" &&
        search.trim()
      ) {
        const regex =
          new RegExp(
            escapeRegex(
              search.trim()
            ),
            "i"
          );

        filter.$or = [
          {
            title: regex,
          },
          {
            slug: regex,
          },
          {
            destination: regex,
          },
          {
            location: regex,
          },
          {
            category: regex,
          },
          {
            overview: regex,
          },
        ];
      }

      const [
        tours,
        total,
      ] = await Promise.all([
        Tour.find(filter)
          .populate(
            "createdBy",
            "firstName lastName email"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Tour.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,

        tours,

        pagination:
          buildPagination(
            total,
            pageNumber,
            limitNumber
          ),
      });
    } catch (error) {
      console.error(
        "[ADMIN] Tours error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load tours.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ADMIN TOUR
|--------------------------------------------------------------------------
| GET /api/admin/tours/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/tours/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tour ID.",
        });
      }

      const tour =
        await Tour.findById(id)
          .populate(
            "createdBy",
            "firstName lastName email"
          )
          .lean();

      if (!tour) {
        return res.status(404).json({
          success: false,
          message:
            "Tour not found.",
        });
      }

      return res.status(200).json({
        success: true,
        tour,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Tour details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load tour.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
| POST /api/admin/tours
|--------------------------------------------------------------------------
*/

router.post(
  "/tours",
  async (req, res) => {
    try {
      const payload =
        buildTourPayload(
          req.body
        );

      /*
      |--------------------------------------------------------------------
      | REQUIRED FIELDS
      |--------------------------------------------------------------------
      */

      if (!payload.title) {
        return res.status(400).json({
          success: false,
          message:
            "Tour title is required.",
        });
      }

      if (!payload.destination) {
        return res.status(400).json({
          success: false,
          message:
            "Tour destination is required.",
        });
      }

      if (
        !payload.slug
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tour slug is required.",
        });
      }

      if (
        !Number.isFinite(
          payload.price
        ) ||
        payload.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tour price must be a valid non-negative number.",
        });
      }

      if (
        !Number.isFinite(
          payload.rating
        ) ||
        payload.rating < 0 ||
        payload.rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tour rating must be between 0 and 5.",
        });
      }

      /*
      |--------------------------------------------------------------------
      | DUPLICATE SLUG CHECK
      |--------------------------------------------------------------------
      */

      const existingTour =
        await Tour.findOne({
          slug: payload.slug,
        });

      if (existingTour) {
        return res.status(409).json({
          success: false,
          message:
            "A tour with this slug already exists.",
        });
      }

      /*
      |--------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------
      */

      const tour =
        await Tour.create({
          ...payload,

          createdBy:
            req.user?._id || null,
        });

      return res.status(201).json({
        success: true,

        message:
          "Tour created successfully.",

        tour,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Create tour error:",
        error
      );

      /*
      |--------------------------------------------------------------------
      | MONGOOSE DUPLICATE KEY
      |--------------------------------------------------------------------
      */

      if (
        error?.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A tour with this slug already exists.",
        });
      }

      if (
        error?.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            Object.values(
              error.errors
            )
              .map(
                (item) =>
                  item.message
              )
              .join(", "),
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create tour.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
| PUT /api/admin/tours/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/tours/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tour ID.",
        });
      }

      const payload =
        buildTourPayload(
          req.body
        );

      if (!payload.title) {
        return res.status(400).json({
          success: false,
          message:
            "Tour title is required.",
        });
      }

      if (!payload.destination) {
        return res.status(400).json({
          success: false,
          message:
            "Tour destination is required.",
        });
      }

      if (!payload.slug) {
        return res.status(400).json({
          success: false,
          message:
            "Tour slug is required.",
        });
      }

      if (
        !Number.isFinite(
          payload.price
        ) ||
        payload.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tour price must be a valid non-negative number.",
        });
      }

      /*
      |--------------------------------------------------------------------
      | SLUG CONFLICT
      |--------------------------------------------------------------------
      */

      const slugConflict =
        await Tour.findOne({
          slug: payload.slug,

          _id: {
            $ne: id,
          },
        });

      if (slugConflict) {
        return res.status(409).json({
          success: false,
          message:
            "Another tour already uses this slug.",
        });
      }

      /*
      |--------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------
      */

      const tour =
        await Tour.findByIdAndUpdate(
          id,
          {
            $set: payload,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!tour) {
        return res.status(404).json({
          success: false,
          message:
            "Tour not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Tour updated successfully.",

        tour,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Update tour error:",
        error
      );

      if (
        error?.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A tour with this slug already exists.",
        });
      }

      if (
        error?.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            Object.values(
              error.errors
            )
              .map(
                (item) =>
                  item.message
              )
              .join(", "),
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update tour.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
| DELETE /api/admin/tours/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/tours/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tour ID.",
        });
      }

      const tour =
        await Tour.findByIdAndDelete(
          id
        );

      if (!tour) {
        return res.status(404).json({
          success: false,
          message:
            "Tour not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Tour deleted successfully.",

        tourId: id,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Delete tour error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete tour.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
|--------------------------------------------------------------------------
| GET /api/admin/bookings
|--------------------------------------------------------------------------
*/

router.get(
  "/bookings",
  async (req, res) => {
    try {
      const {
        status,
        paymentStatus,
        page = 1,
        limit = 20,
        search = "",
      } = req.query;

      const {
        pageNumber,
        limitNumber,
        skip,
      } = parsePagination(
        page,
        limit
      );

      const filter = {};

      if (
        status &&
        status !== "all"
      ) {
        const normalizedStatus =
          String(status)
            .trim()
            .toLowerCase();

        if (
          !BOOKING_STATUSES.includes(
            normalizedStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid booking status.",
          });
        }

        filter.status =
          normalizedStatus;
      }

      if (
        paymentStatus &&
        paymentStatus !== "all"
      ) {
        const normalizedPaymentStatus =
          String(paymentStatus)
            .trim()
            .toLowerCase();

        if (
          !PAYMENT_STATUSES.includes(
            normalizedPaymentStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid payment status.",
          });
        }

        filter.paymentStatus =
          normalizedPaymentStatus;
      }

      if (
        typeof search === "string" &&
        search.trim()
      ) {
        const regex =
          new RegExp(
            escapeRegex(
              search.trim()
            ),
            "i"
          );

        filter.$or = [
          {
            bookingId: regex,
          },
          {
            tourTitle: regex,
          },
          {
            tourName: regex,
          },
          {
            destination: regex,
          },
          {
            "traveler.firstName":
              regex,
          },
          {
            "traveler.lastName":
              regex,
          },
          {
            "traveler.email":
              regex,
          },
          {
            "traveler.phone":
              regex,
          },
        ];
      }

      const [
        bookings,
        total,
      ] = await Promise.all([
        Booking.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Booking.countDocuments(
          filter
        ),
      ]);

      return res.status(200).json({
        success: true,

        bookings,

        pagination:
          buildPagination(
            total,
            pageNumber,
            limitNumber
          ),
      });
    } catch (error) {
      console.error(
        "[ADMIN] Bookings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load bookings.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
| GET /api/admin/bookings/:bookingId
|--------------------------------------------------------------------------
*/

router.get(
  "/bookings/:bookingId",
  async (req, res) => {
    try {
      const booking =
        await Booking.findOne({
          bookingId:
            req.params.bookingId,
        }).lean();

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      return res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Booking details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load booking.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

router.patch(
  "/bookings/:bookingId/status",
  async (req, res) => {
    try {
      const status =
        String(
          req.body?.status || ""
        )
          .trim()
          .toLowerCase();

      if (
        !BOOKING_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking status.",
        });
      }

      const booking =
        await Booking.findOneAndUpdate(
          {
            bookingId:
              req.params.bookingId,
          },
          {
            $set: {
              status,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Booking status updated successfully.",
        booking,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Booking status update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update booking status.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

async function updatePaymentStatus(
  req,
  res
) {
  try {
    const paymentStatus =
      String(
        req.body?.paymentStatus ||
          ""
      )
        .trim()
        .toLowerCase();

    const paymentReference =
      typeof req.body
        ?.paymentReference ===
      "string"
        ? req.body.paymentReference.trim()
        : "";

    if (
      !PAYMENT_STATUSES.includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status.",
      });
    }

    const update = {
      paymentStatus,

      paidAt:
        paymentStatus === "paid"
          ? new Date()
          : null,
    };

    if (paymentReference) {
      update.paymentReference =
        paymentReference;
    }

    if (
      paymentStatus === "paid"
    ) {
      update.status =
        "confirmed";
    }

    const booking =
      await Booking.findOneAndUpdate(
        {
          bookingId:
            req.params.bookingId,
        },
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment status updated successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "[ADMIN] Payment update error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update payment status.",
    });
  }
}

router.patch(
  "/bookings/:bookingId/payment-status",
  updatePaymentStatus
);

router.patch(
  "/bookings/:bookingId/payment",
  updatePaymentStatus
);

/*
|--------------------------------------------------------------------------
| DELETE BOOKING
|--------------------------------------------------------------------------
*/

router.delete(
  "/bookings/:bookingId",
  async (req, res) => {
    try {
      const booking =
        await Booking.findOneAndDelete({
          bookingId:
            req.params.bookingId,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Booking deleted successfully.",
      });
    } catch (error) {
      console.error(
        "[ADMIN] Delete booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete booking.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

router.get(
  "/customers",
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
      } = req.query;

      const {
        pageNumber,
        limitNumber,
        skip,
      } = parsePagination(
        page,
        limit
      );

      const filter = {
        role: "customer",
      };

      if (
        typeof search === "string" &&
        search.trim()
      ) {
        const regex =
          new RegExp(
            escapeRegex(
              search.trim()
            ),
            "i"
          );

        filter.$or = [
          {
            firstName: regex,
          },
          {
            lastName: regex,
          },
          {
            email: regex,
          },
          {
            phone: regex,
          },
          {
            country: regex,
          },
        ];
      }

      const [
        customers,
        total,
      ] = await Promise.all([
        User.find(filter)
          .select(
            "-password -passwordHash"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        User.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,

        customers,

        pagination:
          buildPagination(
            total,
            pageNumber,
            limitNumber
          ),
      });
    } catch (error) {
      console.error(
        "[ADMIN] Customers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load customers.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/

router.get(
  "/customers/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid customer ID.",
        });
      }

      const customer =
        await User.findOne({
          _id: id,
          role: "customer",
        })
          .select(
            "-password -passwordHash"
          )
          .lean();

      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found.",
        });
      }

      const bookings =
        await Booking.find({
          userId: customer._id,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        customer,
        bookings,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Customer details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load customer.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ACTIVATE / DEACTIVATE CUSTOMER
|--------------------------------------------------------------------------
*/

router.patch(
  "/customers/:id/status",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { isActive } =
        req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid customer ID.",
        });
      }

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false.",
        });
      }

      const customer =
        await User.findOneAndUpdate(
          {
            _id: id,
            role: "customer",
          },
          {
            $set: {
              isActive,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found.",
        });
      }

      const safeCustomer =
        typeof customer.toSafeObject ===
        "function"
          ? customer.toSafeObject()
          : customer.toObject();

      return res.status(200).json({
        success: true,

        message: isActive
          ? "Customer account activated."
          : "Customer account deactivated.",

        customer:
          safeCustomer,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Customer status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update customer status.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DESTINATION MANAGEMENT
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET ALL DESTINATIONS
|--------------------------------------------------------------------------
| GET /api/admin/destinations
|--------------------------------------------------------------------------
*/

router.get(
  "/destinations",
  async (req, res) => {
    try {
      const {
        search = "",
        status = "all",
      } = req.query;

      const filter = {};

      if (status !== "all") {
        filter.isPublished =
          status === "published";
      }

      if (
        typeof search === "string" &&
        search.trim()
      ) {
        const regex = new RegExp(
          escapeRegex(search.trim()),
          "i"
        );

        filter.$or = [
          {
            name: regex,
          },
          {
            location: regex,
          },
          {
            description: regex,
          },
        ];
      }

      const destinations =
        await Destination.find(filter)
          .populate(
            "createdBy",
            "firstName lastName email"
          )
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
        "[ADMIN] Destinations error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load destinations.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE DESTINATION
|--------------------------------------------------------------------------
| GET /api/admin/destinations/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/destinations/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid destination ID.",
        });
      }

      const destination =
        await Destination.findById(id)
          .populate(
            "createdBy",
            "firstName lastName email"
          )
          .lean();

      if (!destination) {
        return res.status(404).json({
          success: false,
          message:
            "Destination not found.",
        });
      }

      return res.status(200).json({
        success: true,
        destination,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Destination details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load destination.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE DESTINATION
|--------------------------------------------------------------------------
| POST /api/admin/destinations
|--------------------------------------------------------------------------
*/

router.post(
  "/destinations",
  async (req, res) => {
    try {
      const name = cleanString(
        req.body?.name
      );

      const location = cleanString(
        req.body?.location
      );

      const description = cleanString(
        req.body?.description
      );

      const image = cleanString(
        req.body?.image
      );

      const isPublished =
        req.body?.isPublished === false
          ? false
          : true;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Destination name is required.",
        });
      }

      if (!location) {
        return res.status(400).json({
          success: false,
          message:
            "Destination location is required.",
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          message:
            "Destination description is required.",
        });
      }

      if (!image) {
        return res.status(400).json({
          success: false,
          message:
            "Destination image is required.",
        });
      }

      const destination =
        await Destination.create({
          name,
          location,
          description,
          image,
          isPublished,
          createdBy:
            req.user?._id || null,
        });

      return res.status(201).json({
        success: true,
        message:
          "Destination created successfully.",
        destination,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Create destination error:",
        error
      );

      if (
        error?.name === "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message: Object.values(
            error.errors
          )
            .map(
              (item) => item.message
            )
            .join(", "),
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create destination.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE DESTINATION
|--------------------------------------------------------------------------
| PUT /api/admin/destinations/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/destinations/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid destination ID.",
        });
      }

      const update = {};

      if (
        req.body?.name !== undefined
      ) {
        update.name = cleanString(
          req.body.name
        );
      }

      if (
        req.body?.location !== undefined
      ) {
        update.location = cleanString(
          req.body.location
        );
      }

      if (
        req.body?.description !== undefined
      ) {
        update.description =
          cleanString(
            req.body.description
          );
      }

      if (
        req.body?.image !== undefined
      ) {
        update.image = cleanString(
          req.body.image
        );
      }

      if (
        req.body?.isPublished !== undefined
      ) {
        update.isPublished =
          Boolean(
            req.body.isPublished
          );
      }

      if (
        update.name !== undefined &&
        !update.name
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Destination name is required.",
        });
      }

      if (
        update.location !== undefined &&
        !update.location
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Destination location is required.",
        });
      }

      if (
        update.description !== undefined &&
        !update.description
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Destination description is required.",
        });
      }

      if (
        update.image !== undefined &&
        !update.image
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Destination image is required.",
        });
      }

      const destination =
        await Destination.findByIdAndUpdate(
          id,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!destination) {
        return res.status(404).json({
          success: false,
          message:
            "Destination not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Destination updated successfully.",
        destination,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Update destination error:",
        error
      );

      if (
        error?.name === "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message: Object.values(
            error.errors
          )
            .map(
              (item) => item.message
            )
            .join(", "),
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update destination.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE DESTINATION
|--------------------------------------------------------------------------
| DELETE /api/admin/destinations/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/destinations/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid destination ID.",
        });
      }

      const destination =
        await Destination.findByIdAndDelete(
          id
        );

      if (!destination) {
        return res.status(404).json({
          success: false,
          message:
            "Destination not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Destination deleted successfully.",
        destinationId: id,
      });
    } catch (error) {
      console.error(
        "[ADMIN] Delete destination error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete destination.",
      });
    }
  }
);
export default router;