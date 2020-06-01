const mongoose = require('mongoose');

// this is commented to test the handle of timezone with mongoose, and if it's
// everything ok in a long period of time, the comments will be removed, but if is
// not, the code will be implemented
// const FamilyGroup = require('./FamilyGroup');

const { Schema } = mongoose;

const fedSchema = new Schema({
  currentDateTime: {
    type: Date
  },
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

fedSchema.pre('save', async function dateTimeByTimeZone(next) {
  // const familyGroup = await FamilyGroup.findById(this.pet.familyGroup).populate('timeZone');
  // const {
  //   timeZone: { offset }
  // } = familyGroup;
  // const date = new Date();
  // this.currentDateTime = date.setHours(date.getHours() + offset);
  this.currentDateTime = new Date();
  next();
});

module.exports = mongoose.model('Fed', fedSchema);
