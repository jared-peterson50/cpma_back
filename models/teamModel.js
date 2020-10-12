const mongoose = require("mongoose");
const User = require("../models/userModel");

const teamSchema = new mongoose.Schema({
  user: [User],
  teamNumber: int,
  teamName: String,
  score: int,
  solution: [int],
});

module.exports = Team = mongoose.model("team", teamSchema);
