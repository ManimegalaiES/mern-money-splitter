// import mongoose from "mongoose";

// const expenseSchema = new mongoose.Schema({
//   groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
//   paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   amount: { type: Number, required: true },
//   description: String,
//   splitBetween: [
//     {
//       userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       share: { type: Number, required: true }
//     }
//   ]
// },{ timestamps:true });

// export default mongoose.model("Expense", expenseSchema);

import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group", 
    required: true 
  },

  paidBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },

  description: String,

  /* ✅ NEW CATEGORY FIELD */
  category: {
    type: String,
    enum: ["Food", "Travel", "Rent", "Entertainment", "Shopping", "Others"],
    required: true
  },

  /* ✅ CUSTOM CATEGORY FIELD */
  customCategory: {
    type: String,
    default: ""
  },

  splitBetween: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      },
      share: { 
        type: Number, 
        required: true 
      }
    }
  ]

}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);