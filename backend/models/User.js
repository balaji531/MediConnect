const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true
    },

    phone: { type: String, trim: true },

    specialization: { type: String, trim: true },
    qualification: { type: String, trim: true },
    availability: [
      {
        day: {
        type: String,
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ]
      },
      slots: [
        {
          type: String
        }
      ]
    }
  ],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String },
    verificationTokenExpire: { type: Date },
  },
  { timestamps: true }
);

// Keep only this one index
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);