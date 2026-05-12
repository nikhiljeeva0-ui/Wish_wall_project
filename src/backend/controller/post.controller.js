const Post = require("../models/post.model");
const mongoose = require("mongoose");

const {
  createPost: createLocalPost,
  listPosts: listLocalPosts,
  findPostById: findLocalPostById,
  likePost: likeLocalPost,
} = require("../utils/localStore");

const isMongoReady = () => mongoose.connection.readyState === 1;

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    if (!isMongoReady()) {
      const post = createLocalPost({
        content: content.trim(),
        authorId: req.user.userId,
      });

      return res.status(201).json({
        message: "Post created",
        post,
      });
    }

    const post = await Post.create({
      content: content.trim(),
      author: req.user.userId,
    });

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
    if (!isMongoReady()) {
      return res.status(200).json(listLocalPosts());
    }

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
    if (!isMongoReady()) {
      const post = findLocalPostById(req.params.id);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      if (post.likes.includes(req.user.userId)) {
        return res.status(400).json({
          error: "Post already liked",
        });
      }

      return res.status(200).json({
        message: "Post liked",
        post: likeLocalPost({
          postId: req.params.id,
          userId: req.user.userId,
        }),
      });
    }

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

module.exports = {
  createPost,
  getAllPosts,
  likePost,
};