const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const {
  sanitizeUser,
  findUserById,
  findUserByEmail,
  updateUser,
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

module.exports = {
	getMe,
	updateMe,
};
