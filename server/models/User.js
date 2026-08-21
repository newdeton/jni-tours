import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| JNI TOURS — USER MODEL
|--------------------------------------------------------------------------
|
| Supports:
| - Customer accounts
| - Administrator accounts
| - Authentication credentials
| - Profile information
| - Account activation/deactivation
| - Login tracking
| - Safe frontend serialization
|
|--------------------------------------------------------------------------
*/

const userSchema = new mongoose.Schema(
  {
    // =========================================================
    // BASIC INFORMATION
    // =========================================================

    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
      minlength: [
        2,
        "First name must be at least 2 characters.",
      ],
      maxlength: [
        50,
        "First name cannot exceed 50 characters.",
      ],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
      minlength: [
        2,
        "Last name must be at least 2 characters.",
      ],
      maxlength: [
        50,
        "Last name cannot exceed 50 characters.",
      ],
    },

    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      maxlength: [
        150,
        "Email address cannot exceed 150 characters.",
      ],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        30,
        "Phone number cannot exceed 30 characters.",
      ],
    },

    country: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        100,
        "Country cannot exceed 100 characters.",
      ],
    },

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [
        8,
        "Password must be at least 8 characters.",
      ],
      select: false,
    },

    // =========================================================
    // ACCOUNT ROLE
    // =========================================================

    role: {
      type: String,
      enum: {
        values: ["customer", "admin"],
        message:
          "Role must be either customer or admin.",
      },
      default: "customer",
      lowercase: true,
      trim: true,
      index: true,
    },

    // =========================================================
    // ACCOUNT STATUS
    // =========================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =========================================================
    // PROFILE
    // =========================================================

    avatar: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        1000,
        "Avatar URL cannot exceed 1000 characters.",
      ],
    },

    // =========================================================
    // LOGIN TRACKING
    // =========================================================

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,

    // =======================================================
    // JSON
    // =======================================================

    toJSON: {
      virtuals: true,

      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },

    // =======================================================
    // OBJECT
    // =======================================================

    toObject: {
      virtuals: true,
    },
  }
);

// =============================================================
// FULL NAME
// =============================================================

userSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${
    this.lastName || ""
  }`.trim();
});

// =============================================================
// ADMIN VIRTUAL
// =============================================================

userSchema.virtual("isAdmin").get(function () {
  return (
    String(this.role || "")
      .trim()
      .toLowerCase() === "admin"
  );
});

// =============================================================
// CUSTOMER VIRTUAL
// =============================================================

userSchema.virtual("isCustomer").get(function () {
  return (
    String(this.role || "")
      .trim()
      .toLowerCase() === "customer"
  );
});

// =============================================================
// ROLE HELPER
// =============================================================

userSchema.methods.hasRole = function (role) {
  return (
    String(this.role || "")
      .trim()
      .toLowerCase() ===
    String(role || "")
      .trim()
      .toLowerCase()
  );
};

// =============================================================
// ADMIN HELPER
// =============================================================

userSchema.methods.isAdminUser = function () {
  return this.hasRole("admin");
};

// =============================================================
// SAFE USER OBJECT
// =============================================================

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    _id: this._id,

    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,

    email: this.email,
    phone: this.phone,
    country: this.country,

    role: this.role,

    isAdmin: this.isAdmin,
    isCustomer: this.isCustomer,

    isActive: this.isActive,

    avatar: this.avatar,

    lastLoginAt: this.lastLoginAt,

    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// =============================================================
// MODEL
// =============================================================

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;