const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  authCheck,
} = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth");

router.post("/register", signup);
router.post("/signup", signup);

router.post("/login", login);

router.get("/check", authMiddleware, authCheck);

module.exports = router;