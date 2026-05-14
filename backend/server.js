require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// 1. Robust CORS (Must be at the very top)
app.use(cors());
app.options('*', cors()); 

// 2. Database Connection
connectDB();

// 3. Other Middleware
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

// 4. Health Check (Test this in your browser: https://your-url.onrender.com/health)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.get("/", (req, res) => {
  res.send("Garuda WishWall API is Live");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
