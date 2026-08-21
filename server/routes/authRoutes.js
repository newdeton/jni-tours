import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const JWT_EXPIRES_IN = "7d";

/*
|--------------------------------------------------------------------------
| VALIDATE EMAIL
|--------------------------------------------------------------------------
*/

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/*
|--------------------------------------------------------------------------
| CREATE JWT
|--------------------------------------------------------------------------
*/

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

/*
|--------------------------------------------------------------------------
| SAFE USER RESPONSE
|--------------------------------------------------------------------------
*/

const getSafeUser = (user) => {
  if (typeof user.toSafeObject === "function") {
    return user.toSafeObject();
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    role: user.role,
    isActive: user.isActive,
    avatar: user.avatar,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
| POST /api/auth/register
|--------------------------------------------------------------------------
*/

router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone = "",
      country = "",
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, email and password are required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE
    |--------------------------------------------------------------------------
    */

    const normalizedFirstName =
      String(firstName).trim();

    const normalizedLastName =
      String(lastName).trim();

    const normalizedEmail =
      String(email).trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      normalizedFirstName.length < 2 ||
      normalizedFirstName.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name must be between 2 and 50 characters.",
      });
    }

    if (
      normalizedLastName.length < 2 ||
      normalizedLastName.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Last name must be between 2 and 50 characters.",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING ACCOUNT
    |--------------------------------------------------------------------------
    */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE USER
    |--------------------------------------------------------------------------
    */

    const user = await User.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: String(phone).trim(),
      country: String(country).trim(),
      role: "customer",
      isActive: true,
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE JWT
    |--------------------------------------------------------------------------
    */

    const token = createToken(user);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message:
        "Your account has been created successfully.",
      token,
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE EMAIL
    |--------------------------------------------------------------------------
    */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION ERROR
    |--------------------------------------------------------------------------
    */

    if (error.name === "ValidationError") {
      const errors = Object.values(
        error.errors
      ).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message:
          "Please correct the registration information.",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create your account.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      String(email).trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    |
    | password is select:false in the schema, so we
    | explicitly request it here for verification.
    |
    */

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    /*
    |--------------------------------------------------------------------------
    | INVALID CREDENTIALS
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact JNI Tours.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | COMPARE PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE LAST LOGIN
    |--------------------------------------------------------------------------
    */

    user.lastLoginAt = new Date();

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | CREATE JWT
    |--------------------------------------------------------------------------
    */

    const token = createToken(user);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login at this time.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
| GET /api/auth/me
|--------------------------------------------------------------------------
|
| The authentication middleware will be added next.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    return res.json({
      success: true,
      user: getSafeUser(req.user),
    });
  }
);

export default router;