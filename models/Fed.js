const mongoose = require('mongoose');
const FamilyGroup = require('./FamilyGroup');

const { Schema } = mongoose;

const fedSchema = new Schema({
  currentDateTime: {
    type: Date,
    required: true
  },
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'Pet'
  }
});

fedSchema.pre('save', async function dateTimeByTimeZone(next) {
  const familyGroup = await FamilyGroup.findById(this.pet.familyGroup).populate('timeZone');
  const {
    timeZone: { offset }
  } = familyGroup;
  const date = new Date();
  this.currentDateTime = date.setHours(date.getHours() + offset);
  next();
});

module.exports = mongoose.model('Fed', fedSchema);
