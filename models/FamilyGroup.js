const mongoose = require('mongoose');

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
    ref: 'TimeZone',
    required: true
  },
  pets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Pet'
    }
  ]
});

familyGroupSchema.methods.removePetById = async function removePet(petId) {
  const filteredPets = this.pets.filter(pet => pet.toString() !== petId.toString());
  this.pets = filteredPets;
  await this.save();
};

module.exports = mongoose.model('FamilyGroup', familyGroupSchema);
