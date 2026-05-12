const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  createPost,
  getAllPosts,
  likePost,
} = require("../controller/post.controller");

router.post("/", authMiddleware, createPost);

router.get("/", getAllPosts);

router.put("/like/:id", authMiddleware, likePost);

module.exports = router;