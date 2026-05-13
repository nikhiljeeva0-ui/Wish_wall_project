const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  createPost,
  getAllPosts,
  likePost,
  deletePost
} = require("../controller/post.controller");

router.post("/", authMiddleware, createPost);

router.get("/", getAllPosts);

router.put("/like/:id", authMiddleware, likePost);

router.delete("/:id", authMiddleware, deletePost);

module.exports = router;