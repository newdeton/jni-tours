import express from "express";
import User from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN CUSTOMER MANAGEMENT
|--------------------------------------------------------------------------
| Mounted as:
|
| /api/admin/customers
|
| Features for now:
| 1. View registered customers
| 2. Delete customer
| 3. Send/store a message to customer
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
| GET /api/admin/customers
|--------------------------------------------------------------------------
*/

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select(
        "_id firstName lastName email phone country role isActive avatar lastLoginAt createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Admin customers fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load customers.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
| DELETE /api/admin/customers/:id
|--------------------------------------------------------------------------
*/

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    await User.deleteOne({
      _id: customer._id,
    });

    return res.json({
      success: true,
      message: "Customer deleted successfully.",
      customerId: customer._id,
    });
  } catch (error) {
    console.error("Admin customer delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete customer.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| MESSAGE CUSTOMER
|--------------------------------------------------------------------------
| POST /api/admin/customers/:id/message
|--------------------------------------------------------------------------
|
| For now this creates a simple message response.
| We will connect it to the actual messaging/inbox model once
| that part of the project is ready.
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/message",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { subject = "", message = "" } = req.body;

      if (!String(message).trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required.",
        });
      }

      const customer = await User.findOne({
        _id: id,
        role: "customer",
      }).select(
        "_id firstName lastName email"
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | TEMPORARY MESSAGE HANDLING
      |--------------------------------------------------------------------------
      | We are deliberately not creating another database model yet.
      |
      | Once the existing messaging system is confirmed, this endpoint
      | can be connected to it without changing the Customers page.
      |--------------------------------------------------------------------------
      */

      console.log("Admin customer message:", {
        customerId: customer._id.toString(),
        customerEmail: customer.email,
        subject: String(subject).trim(),
        message: String(message).trim(),
        sentBy: req.user?._id?.toString(),
        sentAt: new Date(),
      });

      return res.json({
        success: true,
        message: "Message prepared successfully.",
        customer: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
        },
      });
    } catch (error) {
      console.error("Admin customer message error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to send message.",
      });
    }
  }
);

export default router;