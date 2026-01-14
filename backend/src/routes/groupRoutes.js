import Expense from "../models/Expense.js";
import { balancesFromExpenses } from "../utils/calculate.js";
import { getSettlements } from "../utils/settle.js";
import express from "express";
import Group from "../models/Group.js";
import { recomputeBalances } from "../utils/calculate.js";

const router = express.Router();

// GET all groups
router.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (e) {
    next(e);
  }
});

// POST create group
router.post("/", async (req, res, next) => {
  try {
    const { name, members } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error("Group name is required.");
    }
    if (!Array.isArray(members) || members.length < 2) {
      res.status(400);
      throw new Error("At least 2 members are required.");
    }

    const cleanMembers = members.map((m) => String(m).trim()).filter(Boolean);

    const balances = {};
    for (const m of cleanMembers) balances[m] = 0;

    const group = await Group.create({
      name: name.trim(),
      members: cleanMembers,
      balances,
      totalAmount: 0
    });

    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
});

// GET single group
router.get("/:groupId", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      res.status(404);
      throw new Error("Group not found.");
    }
    res.json(group);
  } catch (e) {
    next(e);
  }
});

// POST settle group (reset balances only)
router.post("/:groupId/settle", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      res.status(404);
      throw new Error("Group not found.");
    }

    const balances = {};
    for (const m of group.members) balances[m] = 0;

    group.balances = balances;
    await group.save();

    res.json({ message: "Settled", group });
  } catch (e) {
    next(e);
  }
});
// DELETE group (and delete its expenses)
// DELETE group (and delete its expenses)
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
// GET settle suggestions: who pays whom
router.get("/:groupId/settlements", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const settlements = getSettlements(group.balances);
    res.json(settlements);
  } catch (e) {
    next(e);
  }
});
// GET category-wise settlements
// GET category-wise settlements
router.get("/:groupId/settlements-by-category", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const expenses = await Expense.find({ groupId: group._id });

    const byCat = {};
    for (const ex of expenses) {
      const cat = ex.category || "General";
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(ex);
    }

    const result = {};
    for (const [cat, list] of Object.entries(byCat)) {
      const balances = balancesFromExpenses(group.members, list);
      const settlements = getSettlements(balances);
      const total =
        Math.round(
          list.reduce((s, e) => s + Number(e.amount || 0), 0) * 100
        ) / 100;

      result[cat] = { total, balances, settlements };
    }

    return res.json(result);
  } catch (e) {
    next(e);
  }
});
export default router;
