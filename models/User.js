const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  familyGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FamilyGroup'
    }
  ]
});

// eslint-disable-next-line func-names
userSchema.pre('save', async function(next) {
  // eslint-disable-next-line prefer-const
  let user = this;
  const hash = await bcrypt.hash(user.password, 10);
  if (!hash) next(new Error('Error hashing the password'));
  user.password = hash;
  next();
});

module.exports = mongoose.model('User', userSchema);
