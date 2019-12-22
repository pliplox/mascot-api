const mongoose = require('mongoose');
const luxon = require('luxon');

const { Schema } = mongoose;

const timeZoneSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: name => luxon.IANAZone.isValidZone(name),
      message: 'Invalid IANA Zone name'
    }
  },
  offset: {
    type: Number,
    required: true
  },
  familyGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FamilyGroup'
    }
  ]
});

module.exports = mongoose.model('TimeZone', timeZoneSchema);
