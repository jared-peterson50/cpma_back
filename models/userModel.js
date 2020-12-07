const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  displayName: { type: String },
  teamName: {type: String, required: true },
  teamNumber: {type: String, required: true },
  role:{ type: String},
  total_score: {type:Number},
  arr:{type: Array,'default': [0, 0, 0, 0, 0]} //5 periods
});

module.exports = User = mongoose.model("user", userSchema);
