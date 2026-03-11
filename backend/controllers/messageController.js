const Message = require('../models/Message');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

function getConversationId(a, b) {
  return [a.toString(), b.toString()].sort().join('_');
}

exports.getHistory = catchAsync(async (req, res) => {
  const withUserId = req.query.with;
  if (!withUserId) {
    return res.status(400).json({ success: false, message: 'Query "with" (user id) required.' });
  }
  const conversationId = getConversationId(req.user._id, withUserId);
  const messages = await Message.find({ conversationId })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .sort({ createdAt: 1 })
    .lean();
  res.status(200).json({ success: true, messages });
});

exports.getConversations = catchAsync(async (req, res) => {
  const myId = req.user._id;
  const messages = await Message.find({
    $or: [{ senderId: myId }, { receiverId: myId }],
  })
    .sort({ createdAt: -1 })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .lean();
  const peerIds = new Set();
  messages.forEach((m) => {
    const peer = m.senderId._id.toString() === myId.toString() ? m.receiverId._id : m.senderId._id;
    peerIds.add(peer.toString());
  });
  const peers = await User.find({ _id: { $in: Array.from(peerIds) } }).select('name email').lean();
  const list = Array.from(peerIds).map((id) => peers.find((p) => p._id.toString() === id)).filter(Boolean);
  res.status(200).json({ success: true, conversations: list });
});
