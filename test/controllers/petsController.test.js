const httpMocks = require('node-mocks-http');
const faker = require('faker');
const petsController = require('../../controllers/petsController');
const loginController = require('../../controllers/loginController');
const TimeZone = require('../../models/TimeZone');
const FamilyGroup = require('../../models/FamilyGroup');
const User = require('../../models/User');
const Pet = require('../../models/Pet');
require('../../models/Fed'); // to be called when getAllPets is called

const databaseHandler = require('../helpers/databaseHandler');

const { createPet, getPet, getAllPets, updatePet, destroyPet } = petsController;

let req;
let res;
let next;

// mocks for user
const {
  internet: { userName, email }
} = faker;

const mockedPassword = '123123';

// mocks for pet
const petNameMock = 'Jazz';
const petBirthdateMock = new Date();

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
});

describe('Pets Controller', () => {
  afterAll(async () => {
    await databaseHandler.close();
    await databaseHandler.clearAll();
  });

  // afterEach(async () => databaseHandler.clearAll());

  let familyGroup;
  let pet;
  let savedFamilyGroup;
  let savedPet;
  let savedTimeZone;

  beforeEach(async () => {
    await databaseHandler.connect();

    // timeZone
    const timeZone = new TimeZone({ name: 'Africa/Accra', offset: 2 });
    savedTimeZone = await timeZone.save();

    // familyGroup
    familyGroup = new FamilyGroup({ name: faker.name.lastName(), timeZone: savedTimeZone });

    // Sign up the user
    const userToAuthenticate = {
      name: userName(),
      email: email().toLowerCase(),
      password: mockedPassword
    };
    req.body = userToAuthenticate;
    await loginController.signUp(req, res, next);

    // Sign in the user
    req.body = { email: userToAuthenticate.email, password: mockedPassword };
    await loginController.signIn(req, res, next);
    const { userId } = res._getData();

    // Assign family group to the user and assign the user to the family group
    familyGroup.users.push(userId);
    savedFamilyGroup = await familyGroup.save();
    req.userId = userId;
    const foundUser = await User.findById(userId);
    foundUser.familyGroups.push(savedFamilyGroup);
    await foundUser.save();
  });

  describe('createPet', () => {
    it('creates a pet', async () => {
      req.body = { name: petNameMock, birthdate: petBirthdateMock };
      req.params.familyGroupId = savedFamilyGroup._id;
      await createPet(req, res, next);
      expect(res.statusCode).toBe(201);
      expect(res._getData().message).toBe('Pet created successfully');
      expect(res._getData().pet).toHaveProperty('id');
      expect(res._getData().pet).toHaveProperty('name', petNameMock);
      expect(res._getData().pet).toHaveProperty('birthdate', petBirthdateMock);
    });
  });

  describe('getPet', () => {
    beforeEach(async () => {
      pet = new Pet({
        name: petNameMock,
        birthdate: petBirthdateMock,
        familyGroup: savedFamilyGroup
      });
      savedPet = await pet.save();
      req.params.petId = savedPet._id;
    });

    it('returns the requested pet', async () => {
      await getPet(req, res, next);
      const responseData = res._getData();
      const { message, pet: responsePet } = responseData;
      expect(message).toBe('Pet successfully found');
      expect(responsePet.id).toBe(savedPet._id.toString());
      expect(responsePet).toBeInstanceOf(Pet);
    });
  });

  describe('getAllPets', () => {
    let savedAnotherPet;
    let familyGroupWithPets;
    beforeEach(async () => {
      pet = new Pet({
        name: petNameMock,
        birthdate: petBirthdateMock,
        familyGroup: savedFamilyGroup
      });

      const anotherPet = new Pet({
        name: 'anotherPetName',
        birthdate: petBirthdateMock,
        familyGroup: savedFamilyGroup
      });

      savedPet = await pet.save();
      savedAnotherPet = await anotherPet.save();

      savedFamilyGroup.pets.push(savedPet, savedAnotherPet);
      familyGroupWithPets = await savedFamilyGroup.save();

      req.params.familyGroupId = familyGroupWithPets._id;
    });

    it('returns all pets from a family group', async () => {
      await getAllPets(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res._getData().pets.length).toBe(2);
    });
  });

  describe('updatePet', () => {
    let updatingPet = null;

    beforeEach(async () => {
      updatingPet = await Pet.create({
        name: petNameMock,
        birthdate: petBirthdateMock,
        familyGroup: savedFamilyGroup
      });

      req.body.pet = {
        id: updatingPet._id,
        name: 'Piscola',
        birthdate: new Date('2000-01-01T00:00:00')
      };
    });

    it('returns the updated pet with updated fields ', async () => {
      await updatePet(req, res, next);
      expect(res._getData().message).toBe('Pet successfully updated');
      expect(res.statusCode).toBe(200);
      expect(res._getData().pet).toHaveProperty('_id', updatingPet._id);
      expect(res._getData().pet).toHaveProperty('birthdate', new Date('2000-01-01T00:00:00'));
      expect(res._getData().pet).toHaveProperty('name', 'Piscola');
    });
  });

  describe('destroyPet', () => {
    let petToDestroy;
    beforeEach(async () => {
      petToDestroy = await Pet.create({
        name: 'Dexter',
        birthdate: new Date(),
        familyGroup: savedFamilyGroup
      });
    });

    it('destroys the pet', async () => {
      req.body.petId = petToDestroy._id;
      await destroyPet(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(res._getData().message).toBe('Pet successfully destroyed');
      expect(res._getData().pet._id).toStrictEqual(petToDestroy._id);
    });
  });
});
