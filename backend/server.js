require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// connect database
connectDB();

app.use(express.json());
app.use(cors({
    origin: ["https://wish-wall-project-zuac.vercel.app", "http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);


app.get("/", (req, res) => {
  res.send("Server Running");
});
// start server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
