import express from "express";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= ADD EXPENSE ================= */
router.post("/", auth, async (req, res) => {
  try {

    const {
      groupId,
      amount,
      description,
      paidBy,
      splitBetween,
      category,
      customCategory
    } = req.body;

    if (!groupId || !amount || !paidBy || !splitBetween?.length) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    /* CATEGORY VALIDATION */
    if (!category) {
      return res.status(400).json({ msg: "Category required" });
    }

    if (category === "Others" && !customCategory) {
      return res.status(400).json({
        msg: "Please enter custom category"
      });
    }

    /* CHECK GROUP */
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    /* VERIFY PAYER IN GROUP */
    if (!group.members.map(m => m.toString()).includes(paidBy)) {
      return res.status(403).json({
        msg: "Payer not in group"
      });
    }

    /* VERIFY SPLIT USERS IN GROUP */
    for (let s of splitBetween) {
      if (!group.members.map(m => m.toString()).includes(s.userId)) {
        return res.status(403).json({
          msg: "Split user not in group"
        });
      }
    }

    /* VERIFY SHARE TOTAL */
    const totalShare = splitBetween.reduce(
      (sum, s) => sum + Number(s.share),
      0
    );

    if (Math.abs(totalShare - Number(amount)) > 0.01) {
      return res.status(400).json({
        msg: "Split does not match total amount"
      });
    }

    /* CREATE EXPENSE */
    const expense = await Expense.create({
      groupId,
      amount,
      description,
      paidBy,
      splitBetween,
      category,
      customCategory: category === "Others" ? customCategory : ""
    });

    /* GET LOGGED USER */
    const user = await User.findById(req.userId);

    /* CREATE NOTIFICATIONS */
    for (const member of group.members) {

      if (member.toString() !== req.userId) {

        await Notification.create({
          user: member,
          message: `${user.name} added ₹${amount} for ${description}`
        });

      }

    }

    res.status(201).json(expense);

  } catch (err) {

    console.error("ADD EXPENSE ERROR:", err);

    res.status(500).json({
      msg: "Failed to add expense"
    });

  }
});


/* ================= GET GROUP EXPENSES ================= */
router.get("/:groupId", auth, async (req, res) => {

  try {

    const expenses = await Expense.find({
      groupId: req.params.groupId
    })
      .populate("paidBy", "name")
      .populate("splitBetween.userId", "name")
      .sort({ createdAt: -1 });

    const formatted = expenses.map(exp => ({

      _id: exp._id,
      description: exp.description,
      amount: exp.amount,
      reatedAt: exp.createdAt,

      category:
        exp.category === "Others"
          ? exp.customCategory
          : exp.category,

      paidBy: {
        _id: exp.paidBy._id,
        name: exp.paidBy.name
      },

      splitBetween: exp.splitBetween.map(s => ({
        userId: s.userId._id,
        name: s.userId.name,
        share: s.share
      }))

    }));

    res.json(formatted);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Failed to load expenses"
    });

  }

});


/* ================= DELETE EXPENSE ================= */
router.delete("/:expenseId", auth, async (req, res) => {

  try {

    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({
        msg: "Expense not found"
      });
    }

    if (expense.paidBy.toString() !== req.userId) {
      return res.status(403).json({
        msg: "Only payer can delete expense"
      });
    }

    await expense.deleteOne();

    res.json({
      msg: "Expense deleted successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Delete failed"
    });

  }

});


/* ================= EDIT EXPENSE ================= */
router.put("/:expenseId", auth, async (req, res) => {

  try {

    const { description, amount, splitBetween } = req.body;

    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({
        msg: "Expense not found"
      });
    }

    if (expense.paidBy.toString() !== req.userId) {
      return res.status(403).json({
        msg: "Only payer can edit expense"
      });
    }

    for (let s of splitBetween) {

      if (!s.userId) {
        return res.status(400).json({
          msg: "Invalid split user"
        });
      }

    }

    const totalShare = splitBetween.reduce(
      (sum, s) => sum + Number(s.share),
      0
    );

    if (Math.abs(totalShare - Number(amount)) > 0.01) {
      return res.status(400).json({
        msg: "Split mismatch"
      });
    }

    expense.description = description;
    expense.amount = amount;

    expense.splitBetween = splitBetween.map(s => ({
      userId: s.userId,
      share: Number(s.share)
    }));

    await expense.save();

    res.json({
      msg: "Expense updated"
    });

  } catch (err) {

    console.error("EDIT ERROR:", err);

    res.status(500).json({
      msg: "Update failed"
    });

  }

});

export default router;