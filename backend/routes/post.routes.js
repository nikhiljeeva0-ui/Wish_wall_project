const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  createPost,
  getAllPosts,
  likePost,
  deletePost,
  unlikePost,
  commentOnPost,
  getPostComments
} = require("../controller/post.controller");

router.post("/", authMiddleware, createPost);

router.get("/", getAllPosts);

router.put("/like/:id", authMiddleware, likePost);

router.put("/unlike/:id", authMiddleware, unlikePost);

router.delete("/:id", authMiddleware, deletePost);

router.post("/comment/:id", authMiddleware, commentOnPost);

router.get("/comment/:id", getPostComments);

module.exports = router;