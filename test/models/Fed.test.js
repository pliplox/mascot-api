const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const Pet = require('../../models/Pet');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');
const Fed = require('../../models/Fed');
const User = require('../../models/User');

const timeZoneMock = { name: 'Africa/Nairobi', offset: 10 };
const familyGroupMock = { name: faker.internet.userName() };
const petMockData = { name: faker.internet.userName(), birthdate: new Date() };
const userMockData = { name: 'name', email: 'email@test.cl', password: 'password' };

let pet;
let timeZone;
let familyGroup;
let fed;
let user;

describe('Fed model', () => {
  beforeAll(async () => databaseHandler.connect());

  afterAll(async () => {
    await databaseHandler.clearAll();
    await databaseHandler.close();
  });

  beforeEach(async () => {
    await databaseHandler.clearAll();
    timeZone = new TimeZone(timeZoneMock);
    familyGroup = new FamilyGroup(familyGroupMock);
    user = new User(userMockData);
    const savedUser = await user.save();

    const savedTimeZone = await timeZone.save();
    familyGroup.timeZone = savedTimeZone;

    const savedFamilyGroup = await familyGroup.save();

    pet = new Pet(petMockData);

    pet.familyGroup = savedFamilyGroup;
    const savedPet = await pet.save();

    fed = new Fed({ pet: savedPet, user: savedUser });
  });

  it('creates and save Fed', async () => {
    const savedFed = await fed.save();

    expect(savedFed._id).toBeDefined();
  });

  it('saves the correct dateTime by timezone in currentDateTimeField', async () => {
    const savedFed = await fed.save();

    const dt = new Date();
    // dt.setHours(dt.getHours() + timeZone.offset);

    // only testing hours because it may be a delay using minutes and seconds
    expect(savedFed.currentDateTime.getHours()).toBe(dt.getHours());
  });

  it('not defined field in schema is undefined', async () => {
    // const new = User.create({ name: 'newuser', email: 'email@new.email', password: 'password' });
    const fedWithInvalidField = new Fed({ pet, user, invalidField: faker.address.zipCode() });
    const savedFedWithInvalidField = await fedWithInvalidField.save();

    expect(savedFedWithInvalidField._id).toBeDefined();
    expect(savedFedWithInvalidField.invalidField).toBeUndefined();
  });

  it('fails when required property is not set', async () => {
    const fedWithoutRequiredField = new Fed();
    let err;
    try {
      const savedFedWithoutRequiredField = await fedWithoutRequiredField.save();
      err = savedFedWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.pet).toBeDefined();
  });
});
