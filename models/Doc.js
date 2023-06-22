// models/doc.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const docSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  documentation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Doc", docSchema);
