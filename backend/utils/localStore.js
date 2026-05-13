const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");

const now = () => new Date().toISOString();

const createUserRecord = ({ name, email, password }) => ({
  _id: randomUUID(),
  name,
  email,
  password,
  createdAt: now(),
  updatedAt: now(),
});

const createPostRecord = ({ content, authorId }) => ({
  _id: randomUUID(),
  content,
  author: authorId,
  likes: [],
  createdAt: now(),
  updatedAt: now(),
});

const users = [
  createUserRecord({
    name: "Aisha K.",
    email: "aisha@example.com",
    password: bcrypt.hashSync("password123", 10),
  }),
];

const posts = [
  createPostRecord({
    content: "I wish I could travel to every country before I turn 30 🌍",
    authorId: users[0]._id,
  }),
  createPostRecord({
    content: "Learning frontend development step by step 🚀",
    authorId: users[0]._id,
  }),
];

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const mapPost = (post) => {
  const author = users.find((user) => user._id === post.author);

  return {
    _id: post._id,
    content: post.content,
    author: author ? sanitizeUser(author) : null,
    likes: post.likes,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const createUser = ({ name, email, password }) => {
  const user = createUserRecord({ name, email, password });
  users.push(user);
  return user;
};

const updateUser = (userId, updates) => {
  const user = users.find((entry) => entry._id === userId);

  if (!user) {
    return null;
  }

  if (typeof updates.name === "string") {
    user.name = updates.name;
  }

  if (typeof updates.email === "string") {
    user.email = updates.email;
  }

  if (typeof updates.password === "string") {
    user.password = updates.password;
  }

  user.updatedAt = now();

  return user;
};

const findUserByEmail = (email) => users.find((user) => user.email === email);

const findUserById = (userId) => users.find((user) => user._id === userId);

const listUsers = () => users;

const createPost = ({ content, authorId }) => {
  const post = createPostRecord({ content, authorId });
  posts.unshift(post);
  return post;
};

const listPosts = () => posts.map(mapPost).sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

const findPostById = (postId) => posts.find((post) => post._id === postId);

const likePost = ({ postId, userId }) => {
  const post = findPostById(postId);

  if (!post) {
    return null;
  }

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    post.updatedAt = now();
  }

  return mapPost(post);
};

const deleteLocalPost = (postId) => {
  const index = posts.findIndex(post => post._id === postId);
  if (index !== -1) {
    posts.splice(index, 1);
  }
};

module.exports = {
  sanitizeUser,
  createUser,
  updateUser,
  findUserByEmail,
  findUserById,
  listUsers,
  createPost,
  listPosts,
  findPostById,
  likePost,
  deleteLocalPost,
};