const User = require("../models/user.model");
const Post = require("../models/post.model");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const {
  sanitizeUser,
  findUserById,
  findUserByEmail,
  updateUser,
  listUsers: listLocalUsers,
  followLocalUser,
  unfollowLocalUser,
  bookmarkLocalPost,
  listLocalBookmarks,
} = require("../utils/localStore");

const isMongoReady = () => mongoose.connection.readyState === 1;

const getMe = async (req, res) => {
	try {
		if (!isMongoReady()) {
			const user = findUserById(req.user.userId);

			if (!user) {
				return res.status(404).json({
					error: "User not found",
				});
			}

			return res.status(200).json({ user: sanitizeUser(user) });
		}

		const user = await User.findById(req.user.userId).select("name email createdAt updatedAt");

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
		const { name, email, password } = req.body;

		if (!isMongoReady()) {
			const existingUser = findUserById(req.user.userId);

			if (!existingUser) {
				return res.status(404).json({
					error: "User not found",
				});
			}

			if (email) {
				const duplicateUser = findUserByEmail(email);

				if (duplicateUser && duplicateUser._id !== existingUser._id) {
					return res.status(400).json({
						error: "Email already exists",
					});
				}
			}

			const updates = {
				name: name ? name.trim() : undefined,
				email: email ? email.trim() : undefined,
				password: password ? await bcrypt.hash(password, 10) : undefined,
			};

			const user = updateUser(req.user.userId, updates);

			return res.status(200).json({
				message: "Profile updated",
				user: sanitizeUser(user),
			});
		}

		const user = await User.findById(req.user.userId);

		if (!user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		if (name) {
			user.name = name.trim();
		}

		if (email) {
			const existingUser = await User.findOne({ email, _id: { $ne: user._id } });

			if (existingUser) {
				return res.status(400).json({
					error: "Email already exists",
				});
			}

			user.email = email.trim();
		}

		if (password) {
			user.password = await bcrypt.hash(password, 10);
		}

		await user.save();

		res.status(200).json({
			message: "Profile updated",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (err) {
		res.status(500).json({
			error: err.message,
		});
	}
};

const getAllUsers = async (req, res) => {
  try {
    if (!isMongoReady()) {
      const users = listLocalUsers().map(sanitizeUser);
      return res.status(200).json(users);
    }

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

    if (!isMongoReady()) {
      const updatedUser = followLocalUser(req.user.userId, userToFollowId);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User followed", user: updatedUser });
    }

    const user = await User.findById(req.user.userId);
    const userToFollow = await User.findById(userToFollowId);

    if (!user || !userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.following.includes(userToFollowId)) {
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
    if (userToUnfollowId === req.user.userId) {
      return res.status(400).json({ error: "Cannot unfollow yourself" });
    }

    if (!isMongoReady()) {
      const updatedUser = unfollowLocalUser(req.user.userId, userToUnfollowId);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User unfollowed", user: updatedUser });
    }

    const user = await User.findById(req.user.userId);
    const userToUnfollow = await User.findById(userToUnfollowId);

    if (!user || !userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

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

    if (!isMongoReady()) {
      const updatedUser = bookmarkLocalPost(req.user.userId, postId);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "Bookmark updated", user: updatedUser });
    }

    const user = await User.findById(req.user.userId);
    const post = await Post.findById(postId);

    if (!user || !post) {
      return res.status(404).json({ error: "User or Post not found" });
    }

    if (user.bookmarks.includes(postId)) {
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
    if (!isMongoReady()) {
      const bookmarks = listLocalBookmarks(req.user.userId);
      return res.status(200).json(bookmarks);
    }

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
