const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");

const now = () => new Date().toISOString();

const createUserRecord = ({ name, email, password }) => ({
  _id: randomUUID(),
  name,
  email,
  password,
  followers: [],
  following: [],
  bookmarks: [],
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

const comments = [];

const createCommentRecord = ({ postId, authorId, content }) => ({
  _id: randomUUID(),
  post: postId,
  author: authorId,
  content,
  createdAt: now(),
  updatedAt: now(),
});

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  followers: user.followers || [],
  following: user.following || [],
  bookmarks: user.bookmarks || [],
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

const unlikeLocalPost = ({ postId, userId }) => {
  const post = findPostById(postId);
  if (!post) return null;
  post.likes = post.likes.filter((id) => id !== userId);
  post.updatedAt = now();
  return mapPost(post);
};

const createLocalComment = ({ postId, authorId, content }) => {
  const comment = createCommentRecord({ postId, authorId, content });
  comments.push(comment);
  return {
    _id: comment._id,
    content: comment.content,
    post: comment.post,
    author: sanitizeUser(findUserById(authorId)),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

const listLocalComments = (postId) => {
  return comments
    .filter((c) => c.post === postId)
    .map((c) => ({
      _id: c._id,
      content: c.content,
      post: c.post,
      author: sanitizeUser(findUserById(c.author)),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const followLocalUser = (userId, userToFollowId) => {
  const user = findUserById(userId);
  const userToFollow = findUserById(userToFollowId);
  if (user && userToFollow && !user.following.includes(userToFollowId)) {
    user.following.push(userToFollowId);
    userToFollow.followers.push(userId);
  }
  return user ? sanitizeUser(user) : null;
};

const unfollowLocalUser = (userId, userToUnfollowId) => {
  const user = findUserById(userId);
  const userToUnfollow = findUserById(userToUnfollowId);
  if (user && userToUnfollow) {
    user.following = user.following.filter(id => id !== userToUnfollowId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== userId);
  }
  return user ? sanitizeUser(user) : null;
};

const bookmarkLocalPost = (userId, postId) => {
  const user = findUserById(userId);
  if (user) {
    if (user.bookmarks.includes(postId)) {
      user.bookmarks = user.bookmarks.filter(id => id !== postId);
    } else {
      user.bookmarks.push(postId);
    }
  }
  return user ? sanitizeUser(user) : null;
};

const listLocalBookmarks = (userId) => {
  const user = findUserById(userId);
  if (!user) return [];
  return posts.filter(p => user.bookmarks.includes(p._id)).map(mapPost);
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
  unlikeLocalPost,
  createLocalComment,
  listLocalComments,
  followLocalUser,
  unfollowLocalUser,
  bookmarkLocalPost,
  listLocalBookmarks,
};