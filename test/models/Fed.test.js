const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const Pet = require('../../models/Pet');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');
const Fed = require('../../models/Fed');

const timeZoneMock = { name: 'Africa/Nairobi', offset: 10 };
const familyGroupMock = { name: faker.internet.userName() };
const petMockData = { name: faker.internet.userName(), birthdate: new Date() };
let pet;
let timeZone;
let familyGroup;
let fed;

describe('Fed model', () => {
  afterAll(async () => databaseHandler.close());

  beforeAll(async () => {
    databaseHandler.connect();
    timeZone = new TimeZone(timeZoneMock);
    familyGroup = new FamilyGroup(familyGroupMock);

    const savedTimeZone = await timeZone.save();
    familyGroup.timeZone = savedTimeZone;

    const savedFamilyGroup = await familyGroup.save();

    pet = new Pet(petMockData);

    pet.familyGroup = savedFamilyGroup;
    const savedPet = await pet.save();

    fed = new Fed({ pet: savedPet });
  });

  afterAll(async () => databaseHandler.clearAll());

  it('creates and save Fed', async () => {
    const savedFed = await fed.save();

    expect(savedFed._id).toBeDefined();
  });

  it('saves the correct dateTime by timezone in currentDateTimeField', async () => {
    const savedFed = await fed.save();

    const dt = new Date();
    dt.setHours(dt.getHours() + timeZone.offset);

    // only testing hours because it may be a delay using minutes and seconds
    expect(savedFed.currentDateTime.getHours()).toBe(dt.getHours());
  });

  it('not defined field in schema is undefined', async () => {
    const fedWithInvalidField = new Fed({ pet, invalidField: faker.address.zipCode() });
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
