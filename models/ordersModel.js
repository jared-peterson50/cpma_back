const mongoose = require("mongoose");

const orders = new mongoose.Schema({
  teamID: String,
  timePeriod: int,
  orderQuantity: [int],
  startInventory: [int],
  profit: int,
  remainingInventory: [int]
});

module.exports = orders = mongoose.model("orders", ordersSchema);
