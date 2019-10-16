const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { registerValidation } = require('../validation');

const signUp = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('Email already exists');

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    return res.send({ userId: savedUser._id });
  } catch (err) {
    return res.status(400).send(err);
  }
};

// TO DO: implement signIn functionality with jwt
const signIn = () => {};

module.exports = {
  signUp,
  signIn
};
