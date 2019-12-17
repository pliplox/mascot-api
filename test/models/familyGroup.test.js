const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const FamilyGroup = require('../../models/FamilyGroup');

const familyGroupData = { name: faker.name.lastName(1) };

describe('Family Group Model', () => {
  beforeAll(async () => databaseHandler.connect());

  afterAll(async () => databaseHandler.close());

  beforeEach(async () => databaseHandler.clearAll());

  it('creates and save a Family Group', async () => {
    const validFamilyGroup = new FamilyGroup(familyGroupData);
    const savedFamilyGroup = await validFamilyGroup.save();

    expect(savedFamilyGroup._id).toBeDefined();
    expect(savedFamilyGroup.name).toBe(savedFamilyGroup.name);
  });

  it('not defined field in schema is undefined', async () => {
    const userWithInvalidField = new FamilyGroup({
      ...familyGroupData,
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
