const mongoose = require('mongoose');

const timeZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  offset: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('TimeZone', timeZoneSchema);
