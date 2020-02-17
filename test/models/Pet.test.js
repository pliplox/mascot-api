const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const Pet = require('../../models/Pet');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');

const timeZoneMock = { name: 'Africa/Nairobi', offset: 10 };
const familyGroupMock = { name: faker.internet.userName() };
const petMockData = { name: faker.internet.userName(), birthdate: new Date() };
let pet;
let timeZone;
let familyGroup;

describe('Pet model', () => {
  afterAll(async () => databaseHandler.close());

  beforeAll(async () => {
    databaseHandler.connect();
    timeZone = new TimeZone(timeZoneMock);
    familyGroup = new FamilyGroup(familyGroupMock);

    const savedTimeZone = await timeZone.save();
    familyGroup.timeZone = savedTimeZone;

    await familyGroup.save();

    pet = new Pet(petMockData);
  });

  afterAll(async () => databaseHandler.clearAll());

  it('creates and save a Pet', async () => {
    pet.familyGroup = familyGroup;
    const savedPet = await pet.save();

    expect(savedPet._id).toBeDefined();
  });

  it('not defined field in schema is undefined', async () => {
    const invalidField = { invalidField: faker.address.zipCode(), familyGroup };

    const petWithInvalidField = new Pet({ ...petMockData, ...invalidField });

    const savedPetWithInvalidField = await petWithInvalidField.save();

    expect(savedPetWithInvalidField._id).toBeDefined();
    expect(savedPetWithInvalidField.invalidField).toBeUndefined();
  });

  it('fails when required property is not set', async () => {
    const petWithoutRequiredField = new Pet({ birthdate: new Date() });
    let err;
    try {
      const savedPetWithoutRequiredField = await petWithoutRequiredField.save();
      err = savedPetWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });
});
