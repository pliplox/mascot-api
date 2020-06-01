const httpMocks = require('node-mocks-http');
const databaseHandler = require('../helpers/databaseHandler');

// models
const FamilyGroup = require('../../models/FamilyGroup');
const Fed = require('../../models/Fed');
const Pet = require('../../models/Pet');
const TimeZone = require('../../models/TimeZone');
const User = require('../../models/User');

// controllers
const { signIn, signUp } = require('../../controllers/loginController');
const { createFed, getFed, destroyFed } = require('../../controllers/fedsController');

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
});

describe('Feds Controller', () => {
  const mockUserData = {
    name: 'Joe Profaci',
    email: 'joe.profaci@mafia.com',
    password: '123123'
  };

  let fed;
  let pet;

  let savedFamilyGroup;

  beforeAll(async () => databaseHandler.connect());

  afterAll(async () => databaseHandler.close());

  afterEach(async () => databaseHandler.clearAll());

  beforeEach(async () => {
    // timeZone
    const timeZone = await TimeZone.create({ name: 'Africa/Accra', offset: 2 });

    // familyGroup
    const familyGroup = await FamilyGroup.create({ name: 'Bonanno', timeZone });
    // savedFamilyGroup = await familyGroup.save();

    // Sign up the user
    const userToAuthenticate = mockUserData;
    req.body = userToAuthenticate;
    await signUp(req, res, next);

    // Sign in the user
    req.body = { email: userToAuthenticate.email, password: '123123' };
    await signIn(req, res, next);
    const { userId } = res._getData();
    req.userId = userId;

    const user = await User.findById(userId);

    // pet
    pet = await Pet.create({
      name: 'Capone',
      birthdate: new Date(),
      familyGroup,
      user
    });

    familyGroup.pets.push(pet);
    await familyGroup.save();
  });

  describe('createFed', () => {
    it('returns the created fed', async () => {
      req.body.petId = pet._id;
      await createFed(req, res, next);
      expect(res._getData().message).toBe('Fed added successfully');
      expect(res.statusCode).toBe(201);
      expect(res._getData().fed).toBeInstanceOf(Fed);
    });
  });

  describe('getFed', () => {
    beforeEach(async () => {
      const timeZone = await TimeZone.create({ name: 'Africa/Accra', offset: 2 });
      const familyGroup = new FamilyGroup({ name: 'Bonanno', timeZone });
      savedFamilyGroup = await familyGroup.save();

      const user = await User.create({ ...mockUserData, email: 'email@test.cl' });

      pet = await Pet.create({
        name: 'Capone',
        birthdate: new Date(),
        familyGroup: savedFamilyGroup
      });

      fed = await Fed.create({ pet, user });
    });

    it('returns the requested fed', async () => {
      req.params.fedId = fed._id;
      await getFed(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res._getData().message).toBe('Fed successfully found');
      expect(res._getData().fed).toBeInstanceOf(Fed);
    });
  });

  describe('destroyFed', () => {
    let fedToDestroy;
    beforeEach(async () => {
      const timeZone = await TimeZone.create({ name: 'Africa/Accra', offset: 2 });
      const familyGroup = new FamilyGroup({ name: 'Bonanno', timeZone });
      savedFamilyGroup = await familyGroup.save();

      pet = await Pet.create({
        name: 'Capone',
        birthdate: new Date(),
        familyGroup: savedFamilyGroup
      });

      const user = await User.create({ ...mockUserData, email: 'new@email.cl' });

      fedToDestroy = await Fed.create({ pet, user });
    });

    it('destroys the fed', async () => {
      req.body.fedId = fedToDestroy._id;
      await destroyFed(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res._getData().message).toBe('Fed successfully destroyed');
      expect(res._getData().fed._id).toStrictEqual(fedToDestroy._id);
    });
  });
});
