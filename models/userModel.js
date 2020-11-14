const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  displayName: { type: String },
  teamName: {type: String, required: true },
  teamNumber: {type: String, required: true },
  role:{ type: String},
  current_period: {type: Number},
  current_period_score: {type: Number},
  total_score: {type:Number}
});

module.exports = User = mongoose.model("user", userSchema);
