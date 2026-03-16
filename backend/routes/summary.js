import express from "express";
import Expense from "../models/Expense.js";
import Settlement from "../models/Settlement.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:groupId", auth, async (req, res) => {
  const expenses = await Expense.find({ groupId: req.params.groupId });
  const settlements = await Settlement.find({ groupId: req.params.groupId });

  const balance = {};

  expenses.forEach(exp => {
    exp.splitBetween.forEach(s => {
      const u = s.userId.toString();
      const p = exp.paidBy.toString();

      if (!balance[u]) balance[u] = 0;
      if (!balance[p]) balance[p] = 0;

      balance[u] -= s.share;
      balance[p] += s.share;
    });
  });

  settlements.forEach(s => {
    const from = s.fromUser.toString();
    const to = s.toUser.toString();

    balance[from] += s.amount;
    balance[to] -= s.amount;
  });

  // convert balances into transactions
  const debtors = [];
  const creditors = [];

  for (let id in balance) {
    if (balance[id] < 0) debtors.push({ id, amt: -balance[id] });
    else if (balance[id] > 0) creditors.push({ id, amt: balance[id] });
  }

  const transactions = [];

  while (debtors.length && creditors.length) {
    let d = debtors[0];
    let c = creditors[0];

    const pay = Math.min(d.amt, c.amt);

    transactions.push({
      from: d.id,
      to: c.id,
      amount: pay
    });

    d.amt -= pay;
    c.amt -= pay;

    if (d.amt === 0) debtors.shift();
    if (c.amt === 0) creditors.shift();
  }

  const users = await User.find();

  const final = transactions.map(t => ({
    from: users.find(u => u._id.toString() === t.from).name,
    to: users.find(u => u._id.toString() === t.to).name,
    amount: t.amount
  }));

  res.json(final);
});

export default router;
