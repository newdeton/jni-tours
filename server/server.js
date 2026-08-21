import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import { connectDB } from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import adminCustomerRoutes from "./routes/adminCustomerRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import adminBlogRoutes from "./routes/adminBlogRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSER
|--------------------------------------------------------------------------
*/

app.use(express.json());

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Authentication
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

app.use(
  "/api/auth",
  authRoutes
);

/*
 * Public tours
 *
 * GET /api/tours
 * GET /api/tours/:slug
 *
 * Only published tours are returned.
 */

app.use(
  "/api/tours",
  tourRoutes
);

/*
 * Public destinations
 *
 * GET /api/destinations
 * GET /api/destinations/:slug
 *
 * These are the destinations created by administrators.
 *
 * The frontend also keeps its hardcoded destinations,
 * so database failure will not remove the default
 * destinations from the public website.
 */


app.use(
  "/api/destinations",
  destinationRoutes
);

/*
 * Customer bookings
 *
 * GET  /api/bookings
 * POST /api/bookings
 * GET  /api/bookings/:bookingId
 * etc.
 */

app.use(
  "/api/bookings",
  bookingRoutes
);

/*
 * Protected administrator API
 *
 * GET   /api/admin/stats
 *
 * TOURS
 * GET   /api/admin/tours
 * POST  /api/admin/tours
 * PUT   /api/admin/tours/:id
 * DELETE /api/admin/tours/:id
 *
 * BOOKINGS
 * GET   /api/admin/bookings
 * GET   /api/admin/bookings/:bookingId
 * PATCH /api/admin/bookings/:bookingId/status
 * PATCH /api/admin/bookings/:bookingId/payment
 *
 * CUSTOMERS
 * GET   /api/admin/customers
 * GET   /api/admin/customers/:id
 * PATCH /api/admin/customers/:id/status
 *
 * DESTINATIONS
 * GET    /api/admin/destinations
 * POST   /api/admin/destinations
 * PUT    /api/admin/destinations/:id
 * DELETE /api/admin/destinations/:id
 */

app.use(
  "/api/admin",
  adminRoutes
);



app.use(
  "/api/admin/customers",
  adminCustomerRoutes
);


app.use(
  "/api/messages", 
  messageRoutes);


  app.use("/api/admin/blog", adminBlogRoutes);

  app.use(
  "/api/blog",
  blogRoutes
);
/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "JNI Tours API is running",
  });
});

/*
|--------------------------------------------------------------------------
| PAYSTACK - INITIALIZE PAYMENT
|--------------------------------------------------------------------------
*/

app.post(
  "/api/payments/initialize",
  async (req, res) => {
    try {
      const {
        email,
        amount,
        bookingId,
        callbackUrl,
      } = req.body;

      if (
        !email ||
        !amount ||
        !bookingId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, amount and booking ID are required.",
        });
      }

      const response =
        await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email,

            amount: Math.round(
              Number(amount) * 100
            ),

            currency: "USD",

            reference: bookingId,

            callback_url:
              callbackUrl ||
              "http://localhost:5173/payment/success",

            metadata: {
              bookingId,
            },
          },
          {
            headers: {
              Authorization:
                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      return res.json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      console.error(
        "Paystack initialization error:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to initialize payment.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PAYSTACK - VERIFY PAYMENT
|--------------------------------------------------------------------------
*/

app.get(
  "/api/payments/verify/:reference",
  async (req, res) => {
    try {
      const {
        reference,
      } = req.params;

      const response =
        await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization:
                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );

      return res.json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      console.error(
        "Paystack verification error:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to verify payment.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| API 404 HANDLER
|--------------------------------------------------------------------------
|
| Important:
| Return JSON instead of Express' default HTML page.
|
| This prevents errors such as:
|
| Unexpected token '<', "<!DOCTYPE "... is not valid JSON
|
|--------------------------------------------------------------------------
*/

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| GENERAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      success: false,
      message:
        "An unexpected server error occurred.",
    });
  }
);

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `JNI Tours API running on http://localhost:${PORT}`
  );
});