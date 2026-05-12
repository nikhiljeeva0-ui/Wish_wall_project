const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "your_mongodb_url") {
      console.warn("MONGODB_URI is not set. Skipping database connection.");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = connectDB;