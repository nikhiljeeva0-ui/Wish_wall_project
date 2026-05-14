const User = require("../models/user.model");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const {
  sanitizeUser,
  createUser: createLocalUser,
  findUserByEmail,
  findUserById,
} = require("../utils/localStore");

const isMongoReady = () => mongoose.connection.readyState === 1;

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (!isMongoReady()) {
      const existingUser = findUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const user = createLocalUser({
        name: name.trim(),
        email: email.trim(),
        password: hashPassword,
      });

      return res.status(201).json({
        message: "Signup successful",
        user: sanitizeUser(user),
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (!isMongoReady()) {
      const user = findUserByEmail(email);

      if (!user) {
        return res.status(400).json({
          error: "Invalid email",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          error: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: sanitizeUser(user),
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const authCheck = async (req, res) => {
  try {
    if (!isMongoReady()) {
      const user = findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ user: sanitizeUser(user) });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  login,
  authCheck,
};