import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
},{timestamps:true});

export default mongoose.model("Settlement", settlementSchema);
