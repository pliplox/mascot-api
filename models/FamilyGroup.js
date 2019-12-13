const mongoose = require('mongoose');

const { Schema } = mongoose;

const familyGroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  familyMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember'
    }
  ]
});

module.exports = mongoose.model('FamilyGroup', familyGroupSchema);
