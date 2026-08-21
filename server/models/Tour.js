import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "Wildlife Safari",
      trim: true,
    },

    style: {
      type: String,
      default: "Comfort",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    guests: {
      type: String,
      default: "2–6 guests",
      trim: true,
    },

    bestTime: {
      type: String,
      default: "",
      trim: true,
    },

    badge: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    overview: {
      type: String,
      default: "",
      trim: true,
    },

    highlights: {
      type: [String],
      default: [],
    },

    included: {
      type: [String],
      default: [],
    },

    excluded: {
      type: [String],
      default: [],
    },

    itinerary: {
      type: [itinerarySchema],
      default: [],
    },

    accommodation: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tourSchema.index({
  destination: 1,
  category: 1,
});

tourSchema.index({
  status: 1,
  createdAt: -1,
});

const Tour =
  mongoose.models.Tour ||
  mongoose.model("Tour", tourSchema);

export default Tour;