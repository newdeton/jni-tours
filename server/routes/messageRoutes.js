import express from "express";

import Message from "../models/Message.js";
import User from "../models/User.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL MESSAGES
|--------------------------------------------------------------------------
| GET /api/messages
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const messages = await Message.find()
        .populate(
          "sender",
          "firstName lastName email avatar"
        )
        .populate(
          "recipient",
          "firstName lastName email avatar"
        )
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load messages.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADMIN — SEND MESSAGE TO CUSTOMER
|--------------------------------------------------------------------------
| POST /api/messages
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        recipientId,
        subject = "",
        message,
      } = req.body;

      if (!recipientId || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Recipient and message are required.",
        });
      }

      const recipient =
        await User.findById(recipientId);

      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      const newMessage =
        await Message.create({
          sender: req.user._id,
          recipient: recipient._id,
          subject: String(subject).trim(),
          message: String(message).trim(),
          isRead: false,
        });

      const populatedMessage =
        await Message.findById(
          newMessage._id
        )
          .populate(
            "sender",
            "firstName lastName email avatar"
          )
          .populate(
            "recipient",
            "firstName lastName email avatar"
          );

      return res.status(201).json({
        success: true,
        message:
          "Message sent successfully.",
        data: populatedMessage,
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to send message.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADMIN — MARK MESSAGE AS READ
|--------------------------------------------------------------------------
| PATCH /api/messages/:messageId/read
|--------------------------------------------------------------------------
*/

router.patch(
  "/:messageId/read",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const message =
        await Message.findByIdAndUpdate(
          req.params.messageId,
          {
            isRead: true,
          },
          {
            new: true,
          }
        )
          .populate(
            "sender",
            "firstName lastName email avatar"
          )
          .populate(
            "recipient",
            "firstName lastName email avatar"
          );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found.",
        });
      }

      return res.json({
        success: true,
        message,
      });
    } catch (error) {
      console.error(
        "Mark message read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update message.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADMIN — DELETE MESSAGE
|--------------------------------------------------------------------------
| DELETE /api/messages/:messageId
|--------------------------------------------------------------------------
*/

router.delete(
  "/:messageId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const message =
        await Message.findByIdAndDelete(
          req.params.messageId
        );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Message deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete message.",
      });
    }
  }
);

export default router;