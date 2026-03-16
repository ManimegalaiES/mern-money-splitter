import express from "express";
import Group from "../models/Group.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ================= CREATE GROUP ================= */
router.post("/", auth, async (req, res) => {
  try {

    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name required" });
    }

    // find users using emails
    const users = await User.find({
      email: { $in: members || [] }
    });

    // always include logged in user
    const loggedInUser = await User.findById(req.userId);

    if (loggedInUser) users.push(loggedInUser);

    // unique ids
    const uniqueMemberIds = [
      ...new Set(users.map(u => u._id.toString()))
    ];

    // create group
    const group = await Group.create({
      name,
      members: uniqueMemberIds,
      createdBy: req.userId
    });

    /* 🔔 CREATE NOTIFICATIONS */

    for (const memberId of uniqueMemberIds) {

      if (memberId !== req.userId) {

        await Notification.create({
          user: memberId,
          message: `You were added to ${name} group`
        });

      }

    }

    res.status(201).json(group);

  } catch (err) {
    console.error("CREATE GROUP ERROR:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

/* ================= GET MY GROUPS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.userId
    }).populate("members", "name email upiId")
    .populate("createdBy", "name");

    res.json(groups);

  } catch (err) {
    console.error("GET GROUPS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

/* ================= GET SINGLE GROUP ================= */
router.get("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email upiId");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 🔥 Check if user is member
    const isMember = group.members.some(
      m => m._id.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(group);

  } catch (err) {
    console.error("GET SINGLE GROUP ERROR:", err);
    res.status(500).json({ message: "Failed to load group" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { name, members } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group)
      return res.status(404).json({ msg: "Group not found" });

    // Only creator allowed
    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        msg: "Only admin can edit group"
      });
    }

    // ✅ Update name if provided
    if (name !== undefined) {
      group.name = name;
    }

    // ✅ Only run member logic IF members array is sent
    if (members !== undefined) {

      // -------- CHECK MEMBER REMOVAL BALANCE --------

      const removedMembers = group.members.filter(
        m => !members.includes(m.toString())
      );

      if (removedMembers.length > 0) {

        const Expense = (await import("../models/Expense.js")).default;
        const Settlement = (await import("../models/Settlement.js")).default;

        const expenses = await Expense.find({
          groupId: group._id
        });

        const settlements = await Settlement.find({
          groupId: group._id
        });

        const balance = {};

        // expense balances
        expenses.forEach(exp => {
          exp.splitBetween.forEach(s => {

            const u = s.userId.toString();
            const p = exp.paidBy.toString();

            balance[u] = (balance[u] || 0) - s.share;
            balance[p] = (balance[p] || 0) + s.share;
          });
        });

        // settlement adjust
        settlements.forEach(s => {
          balance[s.fromUser] =
            (balance[s.fromUser] || 0) + s.amount;

          balance[s.toUser] =
            (balance[s.toUser] || 0) - s.amount;
        });

        // prevent removal if unpaid balance
        for (let rm of removedMembers) {
          if (Math.abs(balance[rm.toString()] || 0) > 0.01) {
            return res.status(400).json({
              msg: "Cannot remove member with unpaid balance"
            });
          }
        }
      }

      group.members = members;
    }

    await group.save();

    res.json(group);

  } catch (err) {
    console.error("EDIT GROUP ERROR:", err);
    res.status(500).json({
      msg: "Group update failed"
    });
  }
});

/* ================= DELETE GROUP ================= */
router.delete("/:id", auth, async (req, res) => {

  try {

    const group = await Group.findById(req.params.id);

    if (!group)
      return res.status(404).json({
        msg: "Group not found"
      });

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        msg: "Only admin can delete"
      });
    }

    await group.deleteOne();

    res.json({
      msg: "Group deleted"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Delete failed"
    });
  }

});

/* ADD MEMBER */
router.put("/:id/add-member", auth, async (req, res) => {
  try {
    const { email } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group)
      return res.status(404).json({ message: "Group not found" });

    // only admin
    if (group.createdBy.toString() !== req.userId)
      return res.status(403).json({ message: "Only admin allowed" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // prevent duplicate
    if (group.members.includes(user._id))
      return res.status(400).json({
        message: "User already in group"
      });

    group.members.push(user._id);

    await group.save();

    res.json(group);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* REMOVE MEMBER */
router.put("/:id/remove-member", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group)
      return res.status(404).json({ message: "Group not found" });

    // Only admin allowed
    if (group.createdBy.toString() !== req.userId)
      return res.status(403).json({
        message: "Only admin allowed"
      });

    // 🚨 Prevent removing admin
    if (userId === group.createdBy.toString())
      return res.status(400).json({
        message: "Admin cannot be removed"
      });

    /* -------- CHECK BALANCE -------- */

    const Expense = (await import("../models/Expense.js")).default;
    const Settlement = (await import("../models/Settlement.js")).default;

    const expenses = await Expense.find({
      groupId: group._id
    });

    const settlements = await Settlement.find({
      groupId: group._id
    });

    const balance = {};

    // Expense balances
    expenses.forEach(exp => {
      exp.splitBetween.forEach(s => {

        const u = s.userId.toString();
        const p = exp.paidBy.toString();

        balance[u] = (balance[u] || 0) - s.share;
        balance[p] = (balance[p] || 0) + s.share;
      });
    });

    // Settlement adjust
    settlements.forEach(s => {
      balance[s.fromUser] =
        (balance[s.fromUser] || 0) + s.amount;

      balance[s.toUser] =
        (balance[s.toUser] || 0) - s.amount;
    });

    // 🚨 Prevent removal if unpaid balance
    if (Math.abs(balance[userId] || 0) > 0.01) {
      return res.status(400).json({
        message: "Cannot remove member with unpaid balance"
      });
    }

    // ✅ Remove member
    group.members = group.members.filter(
      m => m.toString() !== userId
    );

    await group.save();

    res.json(group);

  } catch (err) {
    console.error("REMOVE MEMBER ERROR:", err);
    res.status(500).json({
      message: "Failed to remove member"
    });
  }
});

export default router;

