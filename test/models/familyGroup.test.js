const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');

const mockName = faker.name.lastName(1);

describe('Family Group Model', () => {
  afterAll(async () => databaseHandler.close());

  beforeAll(async () => databaseHandler.connect());

  let savedTimeZone;
  beforeEach(async () => {
    const timeZone = new TimeZone({ name: 'Africa/Accra', offset: 60 });
    savedTimeZone = await timeZone.save();
  });

  afterAll(async () => databaseHandler.clearAll());

  it('creates and save a Family Group', async () => {
    const validFamilyGroup = new FamilyGroup({ name: mockName, timeZone: savedTimeZone });
    const savedFamilyGroup = await validFamilyGroup.save();

    expect(savedFamilyGroup._id).toBeDefined();
    expect(savedFamilyGroup.name).toBe(mockName);
  });

  it('not defined field in schema is undefined', async () => {
    const familyGroupWithInvalidField = new FamilyGroup({
      timeZone: savedTimeZone,
      name: mockName,
      invalidField: faker.address.zipCode()
    });
    const savedFamilyGroupWithInvalidField = await familyGroupWithInvalidField.save();
    expect(savedFamilyGroupWithInvalidField._id).toBeDefined();
    expect(savedFamilyGroupWithInvalidField.invalidField).toBeUndefined();
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
