import express from "express";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
];

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
| POST /api/bookings
|
| Authentication required.
| The booking is automatically attached to the logged-in user.
|--------------------------------------------------------------------------
*/

router.post("/", protect, async (req, res) => {
  try {
    const {
      bookingId: clientBookingId,
      status: clientStatus,
      paymentStatus: clientPaymentStatus,
      userId: clientUserId,
      _id,
      createdAt,
      updatedAt,
      ...bookingData
    } = req.body;

    /*
     * Never trust these values from the frontend:
     *
     * bookingId
     * status
     * paymentStatus
     * userId
     * MongoDB timestamps
     */

    const booking = await Booking.create({
      ...bookingData,

      /*
       * The authenticated user owns this booking.
       * This comes from the JWT, NOT the frontend.
       */
      userId: req.user._id,

      bookingId: `JNI-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,

      status: "pending",

      paymentStatus: "unpaid",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    /*
     * Mongoose validation error
     */
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => ({
          field: err.path,
          message: err.message,
        })
      );

      return res.status(400).json({
        success: false,
        message:
          "Please correct the booking information.",
        errors,
      });
    }

    /*
     * Duplicate booking ID
     */
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A booking with this information already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create booking.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
| GET /api/bookings
|
| Only bookings belonging to the authenticated user
| are returned.
|--------------------------------------------------------------------------
*/

router.get("/", protect, async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      page = 1,
      limit = 20,
    } = req.query;

    /*
     * Validate booking status
     */
    if (
      status &&
      !BOOKING_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid booking status. Allowed values: ${BOOKING_STATUSES.join(
            ", "
          )}.`,
      });
    }

    /*
     * Validate payment status
     */
    if (
      paymentStatus &&
      !PAYMENT_STATUSES.includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid payment status. Allowed values: ${PAYMENT_STATUSES.join(
            ", "
          )}.`,
      });
    }

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    /*
     * IMPORTANT:
     *
     * Use userId because that is what the booking
     * creation route stores.
     */
    const filter = {
      userId: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus =
        paymentStatus;
    }

    const [bookings, total] =
      await Promise.all([
        Booking.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Booking.countDocuments(filter),
      ]);

    return res.json({
      success: true,

      bookings,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,

        pages: Math.ceil(
          total / limitNumber
        ),

        hasNextPage:
          pageNumber * limitNumber <
          total,

        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get my bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch bookings.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE MY BOOKING
|--------------------------------------------------------------------------
| GET /api/bookings/:bookingId
|
| A customer can only access their own booking.
|--------------------------------------------------------------------------
*/

router.get(
  "/:bookingId",
  protect,
  async (req, res) => {
    try {
      const booking =
        await Booking.findOne({
          bookingId:
            req.params.bookingId,

          userId: req.user._id,
        }).lean();

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      return res.json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error(
        "Get booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch booking.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| CANCEL MY BOOKING
|--------------------------------------------------------------------------
| DELETE /api/bookings/:bookingId
|
| This does NOT physically delete the MongoDB document.
| It changes the booking status to "cancelled".
|--------------------------------------------------------------------------
*/

router.delete(
  "/:bookingId",
  protect,
  async (req, res) => {
    try {
      const booking =
        await Booking.findOne({
          bookingId:
            req.params.bookingId,

          userId: req.user._id,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      /*
       * Completed bookings cannot be cancelled
       * by customers.
       */
      if (
        booking.status ===
        "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed bookings cannot be cancelled.",
        });
      }

      /*
       * Paid bookings should go through proper
       * refund/cancellation handling rather than
       * silently cancelling them.
       */
      if (
        booking.paymentStatus ===
        "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid bookings require cancellation and refund processing by JNI Tours.",
        });
      }

      /*
       * Already cancelled
       */
      if (
        booking.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This booking has already been cancelled.",
        });
      }

      booking.status =
        "cancelled";

      await booking.save();

      return res.json({
        success: true,
        message:
          "Booking cancelled successfully.",
        booking,
      });
    } catch (error) {
      console.error(
        "Cancel booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel booking.",
      });
    }
  }
);

export default router;