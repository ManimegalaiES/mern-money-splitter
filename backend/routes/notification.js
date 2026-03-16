import express from "express";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* GET USER NOTIFICATIONS */
router.get("/", auth, async (req, res) => {

  const notifications = await Notification.find({
    user: req.userId
  }).sort({ createdAt: -1 });

  res.json(notifications);

});

/* MARK AS READ */
router.put("/:id/read", auth, async (req, res) => {

  await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true }
  );

  res.json({ message: "Notification marked read" });

});

export default router;