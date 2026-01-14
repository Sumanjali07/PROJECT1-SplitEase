import express from "express";
import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import { recomputeBalances } from "../utils/calculate.js";

const router = express.Router();

// GET expenses for group
router.get("/:groupId/expenses", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      res.status(404);
      throw new Error("Group not found.");
    }

    const expenses = await Expense.find({ groupId: group._id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (e) {
    next(e);
  }
});
router.delete("/:groupId", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    await Expense.deleteMany({ groupId: group._id });
    await Group.deleteOne({ _id: group._id });

    return res.json({ message: "Group deleted." });
  } catch (e) {
    next(e);
  }
});

// POST create expense
router.post("/:groupId/expenses", async (req, res, next) => {
  try {
    const { title, amount, paidBy, splitBetween } = req.body;

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      res.status(404);
      throw new Error("Group not found.");
    }

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error("Expense title is required.");
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      res.status(400);
      throw new Error("Valid amount is required.");
    }
    if (!paidBy || !group.members.includes(paidBy)) {
      res.status(400);
      throw new Error("PaidBy must be a valid member.");
    }
    if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
      res.status(400);
      throw new Error("SplitBetween must have at least 1 member.");
    }
    for (const p of splitBetween) {
      if (!group.members.includes(p)) {
        res.status(400);
        throw new Error(`Invalid split member: ${p}`);
      }
    }

    const expense = await Expense.create({
      groupId: group._id,
      title: title.trim(),
      amount: amt,
      paidBy,
      splitBetween
    });

    // Recompute balances after creating expense
    const allExpenses = await Expense.find({ groupId: group._id });
    const { balances, totalAmount } = recomputeBalances(group, allExpenses);

    group.balances = balances;
    group.totalAmount = totalAmount;
    await group.save();

    res.status(201).json(expense);
  } catch (e) {
    next(e);
  }
});

// DELETE expense
router.delete("/:groupId/expenses/:expenseId", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      res.status(404);
      throw new Error("Group not found.");
    }

    const ex = await Expense.findOneAndDelete({
      _id: req.params.expenseId,
      groupId: group._id
    });

    if (!ex) {
      res.status(404);
      throw new Error("Expense not found.");
    }

    // Recompute balances after delete
    const allExpenses = await Expense.find({ groupId: group._id });
    const { balances, totalAmount } = recomputeBalances(group, allExpenses);

    group.balances = balances;
    group.totalAmount = totalAmount;
    await group.save();

    res.json({ message: "Expense deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;
