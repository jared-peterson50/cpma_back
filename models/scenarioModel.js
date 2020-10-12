const mongoose = require("mongoose");

var timePeriodSchema = new Schema({ 
    currentTime: int, endTime: int 
}, { noId: true });

const scenarioSchema = new mongoose.Schema({
  timePeriod: [timePeriodSchema],
  productType: [String],
  demand: int,
  retailPrice: int,
  wholesalePrice: int,
  holdingCost: int,
  shortageCost: int
});

module.exports = Scenario = mongoose.model("scenario", scenarioSchema);
