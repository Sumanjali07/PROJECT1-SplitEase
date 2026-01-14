import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true },
    splitBetween: { type: [String], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);
