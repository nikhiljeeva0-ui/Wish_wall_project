const User = require("../models/user.model");
const Post = require("../models/post.model");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId)
			.select("-password")
			.populate("followers", "name email")
			.populate("following", "name email");

		if (!user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		res.status(200).json({ user });
	} catch (err) {
		res.status(500).json({
			error: err.message,
		});
	}
};

const updateMe = async (req, res) => {
	try {
		const { name, email, password, bio, avatar } = req.body;
		console.log("BACKEND: Updating user profile...", { userId: req.user.userId, name, bio });

		const user = await User.findById(req.user.userId);

		if (!user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		if (name) user.name = name.trim();
		if (email) {
			const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
			if (existingUser) {
				return res.status(400).json({ error: "Email already exists" });
			}
			user.email = email.trim();
		}
		if (password) {
			user.password = await bcrypt.hash(password, 10);
		}
		if (bio !== undefined) user.bio = bio.trim();
		if (avatar) user.avatar = avatar;

		await user.save();
		console.log("BACKEND: User updated successfully!");

		res.status(200).json({
			message: "Profile updated",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				bio: user.bio,
				avatar: user.avatar,
				followers: user.followers,
				following: user.following
			},
		});
	} catch (err) {
		console.error("BACKEND: Update Error:", err.message);
		res.status(500).json({
			error: err.message,
		});
	}
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const followUser = async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    if (userToFollowId === req.user.userId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const user = await User.findById(req.user.userId);
    const userToFollow = await User.findById(userToFollowId);

    if (!user || !userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following (convert to string for comparison)
    const isFollowing = user.following.some(id => id.toString() === userToFollowId);

    if (!isFollowing) {
      user.following.push(userToFollowId);
      userToFollow.followers.push(req.user.userId);
      await user.save();
      await userToFollow.save();
    }

    res.status(200).json({ message: "User followed", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userToUnfollowId = req.params.id;
    
    const user = await User.findById(req.user.userId);
    const userToUnfollow = await User.findById(userToUnfollowId);

    if (!user || !userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from following/followers
    user.following = user.following.filter(id => id.toString() !== userToUnfollowId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.userId);

    await user.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const user = await User.findById(req.user.userId);
    const post = await Post.findById(postId);

    if (!user || !post) {
      return res.status(404).json({ error: "User or Post not found" });
    }

    // Use robust ID comparison
    const isBookmarked = user.bookmarks.some(id => id.toString() === postId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
    } else {
      user.bookmarks.push(postId);
    }

    await user.save();
    res.status(200).json({ message: "Bookmark updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "bookmarks",
      populate: { path: "author", select: "name email" }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMe,
  updateMe,
  getAllUsers,
  followUser,
  unfollowUser,
  bookmarkPost,
  getBookmarks,
};
