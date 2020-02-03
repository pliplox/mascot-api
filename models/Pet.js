const mongoose = require('mongoose');

const { Schema } = mongoose;

const petSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  birthdate: { type: Date },
  dailyFeeds: { type: Number, default: 2 },
  familyGroup: {
    type: Schema.Types.ObjectId,
    ref: 'FamilyGroup',
    required: true
  },
  feds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Fed'
    }
  ]
});

module.exports = mongoose.model('Pet', petSchema);
