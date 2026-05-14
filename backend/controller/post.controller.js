const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const mongoose = require("mongoose");

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    const post = await Post.create({
      content: content.trim(),
      author: req.user.userId,
    });

    await post.populate("author", "name email");

    res.status(201).json({
      message: "Post created",
      post,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (post.likes.some((userId) => userId.toString() === req.user.userId)) {
      return res.status(400).json({
        error: "Post already liked",
      });
    }

    post.likes.push(req.user.userId);

    await post.save();

    res.status(200).json({
      message: "Post liked",
      post,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (!post.likes.some((userId) => userId.toString() === req.user.userId)) {
      return res.status(400).json({ error: "Post not liked yet" });
    }

    post.likes = post.likes.filter((userId) => userId.toString() !== req.user.userId);
    await post.save();

    res.status(200).json({ message: "Post unliked", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.userId,
      post: req.params.id,
    });

    await comment.populate("author", "name email");

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPostComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  likePost,
  deletePost,
  unlikePost,
  commentOnPost,
  getPostComments,
};