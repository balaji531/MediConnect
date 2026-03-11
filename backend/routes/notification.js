const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req,res)=>{

  const notifications = await Notification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.json({ notifications });

});

module.exports = router;