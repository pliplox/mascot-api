const mongoose = require('mongoose');

const { Schema } = mongoose;

const familyMemberSchema = new Schema(
  {
    familyGroup: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyGroup',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
