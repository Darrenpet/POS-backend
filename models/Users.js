const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  join_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  cart: {
    type: Array,
    required: true,
    default: null,
  },
});

module.exports = mongoose.model("User", userSchema);
