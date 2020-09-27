const mongoose = require('mongoose');
const TimeZone = require('./TimeZone');

const { Schema } = mongoose;

const familyGroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  timeZone: {
    type: Schema.Types.ObjectId,
    ref: 'TimeZone'
  },
  pets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Pet'
    }
  ]
});

familyGroupSchema.pre('save', async function defaultTimeZone(next) {
  // next line serves as guard to avoid running this function when a timeZone is already set
  if (this.timeZone) return next();
  try {
    this.timeZone = await TimeZone.findOne();
    return next();
  } catch (e) {
    return next(e);
  }
});

familyGroupSchema.methods.removePetById = async function removePet(petId) {
  const filteredPets = this.pets.filter(pet => pet.toString() !== petId.toString());
  this.pets = filteredPets;
  await this.save();
};

module.exports = mongoose.model('FamilyGroup', familyGroupSchema);
