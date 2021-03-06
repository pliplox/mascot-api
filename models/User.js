const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// This is set due to deprecation of 'collection.ensureIndex'
mongoose.set('useCreateIndex', true);

const { Schema } = mongoose;

const ROLES = { ADMIN: 'ADMIN', BASIC: 'BASIC' };

const validRoleEnum = {
  values: Object.values(ROLES),
  message: "{VALUE} it isn't an allowed role"
};

const loginTypeEnum = {
  values: ['NORMAL', 'GOOGLE', 'FACEBOOK'],
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
    default: ROLES.BASIC,
    enum: validRoleEnum
  },
  loginType: {
    type: String,
    required: true,
    default: 'NORMAL',
    enum: loginTypeEnum
  },
  familyGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FamilyGroup'
    }
  ]
});

userSchema.pre('save', async function encriptPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (e) {
    return next(e);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES };
