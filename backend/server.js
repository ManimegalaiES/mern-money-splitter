import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/group.js";
import expenseRoutes from "./routes/expense.js";
import balanceRoutes from "./routes/balance.js";
import settlementRoutes from "./routes/settlement.js";
import cors from "cors";
import summaryRoutes from "./routes/summary.js";
import notificationRoutes from "./routes/notification.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// app.use(cors({
//   origin: "https://mern-money-splitter.vercel.app",
//   credentials: true
// }));

app.use(cors({
  origin: ["http://localhost:5173","https://mern-money-splitter.vercel.app"],
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/settle", settlementRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user",userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Money Splitter API Running");
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
