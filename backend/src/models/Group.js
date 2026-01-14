import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    members: { type: [String], required: true },
    balances: { type: Map, of: Number, default: {} }, 
    totalAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Group", GroupSchema);
