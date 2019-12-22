const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');

const mockName = faker.name.lastName(1);

describe('Family Group Model', () => {
  beforeAll(async () => databaseHandler.connect());

  afterAll(async () => databaseHandler.close());

  beforeEach(async () => databaseHandler.clearAll());

  it('creates and save a Family Group', async () => {
    const timeZone = new TimeZone({ name: 'Africa/Accra', offset: 60 });
    const savedTimeZone = await timeZone.save();
    const validFamilyGroup = new FamilyGroup({ name: mockName, timeZone: savedTimeZone });
    const savedFamilyGroup = await validFamilyGroup.save();

    expect(savedFamilyGroup._id).toBeDefined();
    expect(savedFamilyGroup.name).toBe(mockName);
  });

  it('not defined field in schema is undefined', async () => {
    const timeZone = new TimeZone({ name: 'Africa/Accra', offset: 60 });
    const savedTimeZone = await timeZone.save();
    const userWithInvalidField = new FamilyGroup({
      timeZone: savedTimeZone,
      name: mockName,
      invalidField: faker.address.zipCode()
    });
    const savedUserWithInvalidField = await userWithInvalidField.save();
    expect(savedUserWithInvalidField._id).toBeDefined();
    expect(savedUserWithInvalidField.invalidField).toBeUndefined();
  });

  it('fails when required property is not set', async () => {
    const familyWithoutRequiredField = new FamilyGroup({ users: faker.random.arrayElement() });
    let err;
    try {
      const savedUserWithoutRequiredField = await familyWithoutRequiredField.save();
      err = savedUserWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });
});
