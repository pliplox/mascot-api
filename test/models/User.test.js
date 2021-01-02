const faker = require('faker');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const databaseHandler = require('../helpers/databaseHandler');
const { User } = require('../../models/User');

describe('User model', () => {
  beforeAll(async () => databaseHandler.openConnection());

  afterAll(async () => databaseHandler.closeConnection());

  afterEach(async () => databaseHandler.deleteCollections());

  const {
    name: { firstName },
    internet: { email, password }
  } = faker;

  const mockedUserData = { name: firstName(), email: email(), password: password() };

  beforeEach(async () => User.create(mockedUserData));

  it('creates and save a User instance', async () => {
    const user = await User.findOne({ email: mockedUserData.email });
    expect(user._id).toBeDefined();
  });

  it('fails when required property is not set', async () => {
    const userWithoutRequiredField = new User();
    let err;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      err = savedUserWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    const {
      errors: { name, email: emailError, password: passwordError }
    } = err;
    expect(name).toBeDefined();
    expect(emailError).toBeDefined();
    expect(passwordError).toBeDefined();
  });

  describe('When user is updated', () => {
    let user;
    beforeEach(async () => {
      user = await User.findOne({ email: mockedUserData.email });
    });

    describe('when updating the password', () => {
      const newPassword = 'awesome new password';
      let updatedUser;

      beforeEach(async () => {
        user.password = newPassword;
        updatedUser = await user.save();
      });

      it('encrypts the new password', async () => {
        expect(bcrypt.compareSync(newPassword, updatedUser.password)).toBeTruthy();
      });
    });

    describe('When not updating the password', () => {
      const newEmail = faker.internet.email();
      let updatedUser;

      beforeEach(async () => {
        user.email = newEmail;
        updatedUser = await user.save();
      });

      it('does not encrypt the password', async () => {
        expect(bcrypt.compareSync(mockedUserData.password, updatedUser.password)).toBeTruthy();
      });
    });
  });
});
