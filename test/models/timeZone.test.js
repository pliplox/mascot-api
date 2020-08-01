const faker = require('faker');
const mongoose = require('mongoose');
const databaseHandler = require('../helpers/databaseHandler');
const TimeZone = require('../../models/TimeZone');

// returns random number between 1 and 100
const offsetMock = Math.round(Math.random() * 100) + 1;
const timeZoneMockData = { name: 'Africa/Nairobi', offset: offsetMock };

describe('Time Zone Model', () => {
  beforeAll(async () => databaseHandler.openConnection());

  /**
   * Clear all test data after every test.
   */
  afterEach(async () => databaseHandler.deleteCollections());

  /**
   * Remove and close the db and server.
   */
  afterAll(async () => databaseHandler.closeConnection());

  it('creates and save a Time Zone', async () => {
    const timeZone = new TimeZone(timeZoneMockData);
    const savedTimeZone = await timeZone.save();

    expect(savedTimeZone._id).toBeDefined();
  });

  it('does not save an undefined field in schema', async () => {
    const timeZoneWithInvalidField = new TimeZone({
      ...timeZoneMockData,
      invalid: faker.commerce.color()
    });
    const savedTimeZone = await timeZoneWithInvalidField.save();
    expect(savedTimeZone.invalid).toBeUndefined();
  });

  it('fails when required property is not set', async () => {
    const timeZoneWithoutRequired = new TimeZone({});
    let err;
    try {
      const savedTimeZone = await timeZoneWithoutRequired.save();
      err = savedTimeZone;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name && err.errors.offset).toBeDefined();
  });

  describe('when saving invalid data', () => {
    let timeZoneWithInvalidData;
    let savedTimeZone;
    const invalidOffsetMock = faker.company.companyName();
    beforeAll(async () => {
      timeZoneWithInvalidData = new TimeZone({
        name: faker.internet.password(),
        offset: invalidOffsetMock
      });
      try {
        savedTimeZone = await timeZoneWithInvalidData.save();
      } catch (error) {
        savedTimeZone = error;
      }
    });

    it('returns a validation error instance', () => {
      expect(savedTimeZone).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    it('returns an invalid IANA Zone error message', () => {
      expect(savedTimeZone.errors.name.message).toBe('Invalid IANA Zone name');
    });

    it('returns an error offset message', () => {
      const offsetErrorMessage = savedTimeZone.errors.offset.message;
      expect(offsetErrorMessage).toBeDefined();
    });
  });
});
