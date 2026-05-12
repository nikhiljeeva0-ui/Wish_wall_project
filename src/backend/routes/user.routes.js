const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
	getMe,
	updateMe,
} = require("../controller/user.controller");

router.get("/me", authMiddleware, getMe);

router.put("/me", authMiddleware, updateMe);

module.exports = router;
