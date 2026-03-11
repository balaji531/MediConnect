require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGODB_URI);

async function createAdmin() {
  const existing = await User.findOne({ email: "admin@mediconnect.com" });

  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  await User.create({
    name: "Super Admin",
    email: "admin@mediconnect.com",
    password: "admin123",   // Will auto hash because of pre-save hook
    role: "admin",
  });

  console.log("Admin Created Successfully");
  process.exit();
}

createAdmin();