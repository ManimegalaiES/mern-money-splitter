import express from "express";
import Settlement from "../models/Settlement.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ADD SETTLEMENT */
router.post("/", auth, async (req, res) => {

  try {

    const { fromUser, toUser, amount, groupId } = req.body;

    if (fromUser !== req.userId) {
      return res.status(403).json({
        message: "You can only pay your own dues"
      });
    }

    const settlement = await Settlement.create({
      fromUser,
      toUser,
      amount,
      groupId
    });

    /* 🔹 Get payer info */
    const payer = await User.findById(req.userId);

    /* 🔔 Create notification */
    await Notification.create({
      user: toUser,
      message: `${payer.name} settled ₹${amount} with you`
    });

    res.json(settlement);

  } catch (err) {
    console.error("SETTLEMENT ERROR:", err);
    res.status(500).json({
      message: "Settlement failed"
    });
  }

});

/* GET GROUP SETTLEMENTS */

router.get("/:groupId", auth, async (req, res) => {

  const settlements = await Settlement.find({
    groupId: req.params.groupId
  })
  .populate("fromUser", "name")
  .populate("toUser", "name");

  res.json(settlements);

});

export default router;