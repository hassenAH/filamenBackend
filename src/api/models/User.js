const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  verified: { type: Boolean, default: false },
  refreshTokens: [{ type: String }],
  profile: {
    phone: { type: String },
    address: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
