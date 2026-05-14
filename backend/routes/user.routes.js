const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  getMe,
  updateMe,
  getAllUsers,
  followUser,
  unfollowUser,
  bookmarkPost,
  getBookmarks,
} = require("../controller/user.controller");

router.get("/me", authMiddleware, getMe);

router.put("/me", authMiddleware, updateMe);

router.get("/", getAllUsers);

router.put("/follow/:id", authMiddleware, followUser);

router.put("/unfollow/:id", authMiddleware, unfollowUser);

router.put("/bookmark/:id", authMiddleware, bookmarkPost);

router.get("/bookmarks", authMiddleware, getBookmarks);

module.exports = router;
