const mongoose = require('mongoose');

const { Schema } = mongoose;

const petSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  birthdate: { type: Date },
  dailyFeeds: { type: Number, default: 2 },
  familyGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FamilyGroup'
    }
  ]
});

module.exports = mongoose.model('Pet', petSchema);
