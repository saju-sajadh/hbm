const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userid: {
    type: String,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
  },
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  contactNumber: {
    type: String,
    match: [/^\d{10}$/, "Please use a valid contact number."],
  },
  address: {
    type: String
  },
  bio: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  }
});

const User = mongoose.models.user || mongoose.model("user", userSchema);

module.exports = User;
