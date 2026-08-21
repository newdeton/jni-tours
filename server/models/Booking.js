import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| BOOKING SCHEMA
|--------------------------------------------------------------------------
| Stores complete tour booking information for JNI Tours.
|--------------------------------------------------------------------------
*/

const bookingSchema = new mongoose.Schema(
  {
    // ======================================================================
    // OWNER / CUSTOMER
    // ======================================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ======================================================================
    // BOOKING IDENTIFICATION
    // ======================================================================

    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // ======================================================================
    // TOUR INFORMATION
    // ======================================================================

    tourId: {
      type: String,
      required: true,
      trim: true,
    },

    tourSlug: {
      type: String,
      default: "",
      trim: true,
    },

    tourTitle: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================================
    // TRAVEL INFORMATION
    // ======================================================================

    travelDate: {
      type: String,
      required: true,
      trim: true,
    },

    adults: {
      type: Number,
      default: 1,
      min: 1,
    },

    children: {
      type: Number,
      default: 0,
      min: 0,
    },

    travelers: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ======================================================================
    // LEAD TRAVELER
    // ======================================================================

    traveler: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
      },

      requests: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ======================================================================
    // ACCOMMODATION
    // ======================================================================

    accommodation: {
      id: {
        type: String,
        default: "",
        trim: true,
      },

      name: {
        type: String,
        default: "",
        trim: true,
      },

      price: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ======================================================================
    // EXTRAS
    // ======================================================================

    extras: [
      {
        id: {
          type: String,
          default: "",
          trim: true,
        },

        name: {
          type: String,
          default: "",
          trim: true,
        },

        description: {
          type: String,
          default: "",
          trim: true,
        },

        price: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    // ======================================================================
    // PRICING
    // ======================================================================

    pricing: {
      adultPrice: {
        type: Number,
        default: 0,
        min: 0,
      },

      adultsCost: {
        type: Number,
        default: 0,
        min: 0,
      },

      childrenCost: {
        type: Number,
        default: 0,
        min: 0,
      },

      accommodationCost: {
        type: Number,
        default: 0,
        min: 0,
      },

      extrasCost: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },

      currency: {
        type: String,
        default: "USD",
        uppercase: true,
        trim: true,
      },
    },

    // ======================================================================
    // BOOKING STATUS
    // ======================================================================

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    // ======================================================================
    // PAYMENT
    // ======================================================================

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "unpaid",
      index: true,
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================================
// DATABASE INDEXES
// ============================================================================

bookingSchema.index({
  userId: 1,
  createdAt: -1,
});

bookingSchema.index({
  status: 1,
  createdAt: -1,
});

bookingSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

bookingSchema.index({
  travelDate: 1,
});

// ============================================================================
// MODEL
// ============================================================================
//
// Prevents OverwriteModelError during development / hot reload.
//

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;