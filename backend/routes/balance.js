import express from "express";
import Expense from "../models/Expense.js";
import Settlement from "../models/Settlement.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:groupId", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    const settlements = await Settlement.find({ groupId: req.params.groupId });

    const rawBalance = {};

    // 1️⃣ Expense calculation
    expenses.forEach(exp => {
      exp.splitBetween.forEach(s => {
        if (!s.userId) return;
        const userId = s.userId.toString();
        const paidBy = exp.paidBy.toString();

        if (!rawBalance[userId]) rawBalance[userId] = 0;
        if (!rawBalance[paidBy]) rawBalance[paidBy] = 0;

        rawBalance[userId] -= s.share;
        rawBalance[paidBy] += s.share;
      });
    });

    // 2️⃣ Settlement adjustment
    settlements.forEach(s => {
      const from = s.fromUser.toString();
      const to = s.toUser.toString();

      if (!rawBalance[from]) rawBalance[from] = 0;
      if (!rawBalance[to]) rawBalance[to] = 0;

      rawBalance[from] += s.amount;
      rawBalance[to] -= s.amount;
    });

    // 3️⃣ If no data, return empty array
    if (Object.keys(rawBalance).length === 0) {
      return res.json([]);
    }

    // 4️⃣ Convert to names
    const users = await User.find({ _id: { $in: Object.keys(rawBalance) } });

    const final = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      balance: rawBalance[u._id.toString()] || 0
    }));

    res.json(final);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Balance calculation failed" });
  }
});

export default router;
