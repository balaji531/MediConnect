const Message = require('../models/Message');
const { verifyToken } = require('../utils/jwt');

function getConversationId(a, b) {
  return [a.toString(), b.toString()].sort().join('_');
}

function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.authToken;
    if (!token) return next(new Error('Auth required'));
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user_${socket.userId}`;
    socket.join(room);

    socket.on('send_message', async (payload, callback) => {
      const { to, content } = payload || {};
      if (!to || !content || typeof content !== 'string') {
        return callback?.({ success: false, message: 'Invalid payload' });
      }
      try {
        const conversationId = getConversationId(socket.userId, to);
        const msg = await Message.create({
          senderId: socket.userId,
          receiverId: to,
          content: content.trim(),
          conversationId,
        });
        const populated = await Message.findById(msg._id)
          .populate('senderId', 'name')
          .populate('receiverId', 'name')
          .lean();
        io.to(`user_${to}`).emit('message', populated);
        callback?.({ success: true, message: populated });
      } catch (err) {
        callback?.({ success: false, message: err.message });
      }
    });

    // Video call signaling
    socket.on('video_call_request', (payload) => {
      const { to } = payload || {};
      if (to) io.to(`user_${to}`).emit('video_call_request', { from: socket.userId });
    });
    socket.on('video_call_accept', (payload) => {
      const { to } = payload || {};
      if (to) io.to(`user_${to}`).emit('video_call_accept', { from: socket.userId });
    });
    socket.on('video_call_reject', (payload) => {
      const { to } = payload || {};
      if (to) io.to(`user_${to}`).emit('video_call_reject', { from: socket.userId });
    });
    socket.on('webrtc_offer', (payload) => {
      const { to, offer } = payload || {};
      if (to && offer) io.to(`user_${to}`).emit('webrtc_offer', { from: socket.userId, offer });
    });
    socket.on('webrtc_answer', (payload) => {
      const { to, answer } = payload || {};
      if (to && answer) io.to(`user_${to}`).emit('webrtc_answer', { from: socket.userId, answer });
    });
    socket.on('webrtc_ice_candidate', (payload) => {
      const { to, candidate } = payload || {};
      if (to && candidate) io.to(`user_${to}`).emit('webrtc_ice_candidate', { from: socket.userId, candidate });
    });
    socket.on('video_call_hangup', (payload) => {
      const { to } = payload || {};
      if (to) io.to(`user_${to}`).emit('video_call_hangup', { from: socket.userId });
    });

    // Appointment notification
socket.on('send_notification', (payload) => {

  const { to, message } = payload || {};

  if (!to || !message) return;

  io.to(`user_${to}`).emit('notification', {
    message,
    from: socket.userId
  });

});
    socket.on('disconnect', () => {});
  });
}

module.exports = { setupSocket, getConversationId };
