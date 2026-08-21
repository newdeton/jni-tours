import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.js";

dotenv.config();

const ADMIN_EMAIL = "admin@tours.com";
const ADMIN_PASSWORD = "Password123!";

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not configured in .env"
      );
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required."
      );
    }

    if (ADMIN_PASSWORD.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must be at least 8 characters."
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected.");

    const email =
      ADMIN_EMAIL.trim().toLowerCase();

    const existingUser =
      await User.findOne({ email });

    /*
    |--------------------------------------------------------------------------
    | EXISTING ACCOUNT
    |--------------------------------------------------------------------------
    */

    if (existingUser) {
      existingUser.role = "admin";
      existingUser.isActive = true;

      /*
      | If the existing account already has a password,
      | leave it unchanged.
      |
      | This allows an existing customer account to be
      | promoted safely to administrator.
      */

      await existingUser.save();

      console.log(
        "========================================"
      );

      console.log(
        "EXISTING ACCOUNT PROMOTED TO ADMIN"
      );

      console.log(
        "========================================"
      );

      console.log(
        `Email: ${existingUser.email}`
      );

      console.log(
        `Role: ${existingUser.role}`
      );

      console.log(
        `Active: ${existingUser.isActive}`
      );

      console.log(
        "========================================"
      );

      await mongoose.disconnect();

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE NEW ADMIN
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await bcrypt.hash(
        ADMIN_PASSWORD,
        12
      );

    const admin =
      await User.create({
        firstName: "JNI",
        lastName: "Administrator",

        email,

        password: hashedPassword,

        phone: "",

        country: "Kenya",

        role: "admin",

        isActive: true,
      });

    console.log(
      "========================================"
    );

    console.log(
      "ADMIN ACCOUNT CREATED SUCCESSFULLY"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Email: ${admin.email}`
    );

    console.log(
      `Role: ${admin.role}`
    );

    console.log(
      `Active: ${admin.isActive}`
    );

    console.log(
      "========================================"
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error
    );

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
}

createAdmin();