const mongoose = require('mongoose');
// This is set due to deprecation of 'collection.ensureIndex'
mongoose.set('useCreateIndex', true);

const { Schema } = mongoose;

const validRoleEnum = {
  values: ['ADMIN_ROLE', 'USER_ROLE'], //  *** If necessary you can add more roles ***
  message: '{VALUE} it isn´t an allowed role'
};

const loginTypeEnum = {
  values: ['NORMAL', 'GOOGLE'], //  *** If necessary you can add more roles ***
  message: '{VALUE} it isn´t an allowed role'
};

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 256
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 256,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  birthdate: {
    type: Date
  },
  avatarUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  lastLogin: Date,
  role: {
    type: String,
    required: true,
    default: 'USER_ROLE',
    enum: validRoleEnum
  },
  loginType: {
    type: String,
    required: true,
    default: 'NORMAL',
    enum: loginTypeEnum
  },
  familyMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
