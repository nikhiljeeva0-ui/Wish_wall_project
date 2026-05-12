const Message = require('../models/Message');

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};




const createMessage = async (req, res) => {
  try {
    const userName = req.body.name;
    const userMessage = req.body.message;

    const newMessage = await Message.create({
      name: userName,
      message: userMessage
    });

    res.status(201).json(newMessage);
  } 
  catch (error)
   {
    res.status(500).json({ error: "Failed to create the massage" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } 
  catch 
  (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};

module.exports = {
  getAllMessages,
  createMessage,
  deleteMessage
};
