const httpMocks = require('node-mocks-http');
const faker = require('faker');
const familyGroupsController = require('../../controllers/familyGroupsController');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');
const authController = require('../../controllers/authController');
const { User } = require('../../models/User');
const Pet = require('../../models/Pet');

const databaseHandler = require('../helpers/databaseHandler');

const mockedPassword = '123123';

const {
  internet: { userName, email }
} = faker;
const mockedUser = { name: userName(), email: email(), password: mockedPassword };

const {
  getFamilyGroups,
  getFamilyGroup,
  createFamilyGroup,
  updateFamilyGroup,
  destroyFamilyGroup
} = familyGroupsController;

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
});

describe('Family Group Controller', () => {
  beforeAll(async () => databaseHandler.openConnection());

  afterAll(async () => databaseHandler.closeConnection());

  afterEach(async () => databaseHandler.deleteCollections());

  let familyGroup;
  let savedTimeZone;
  let savedFamilyGroup;
  let savedUser;
  let user;

  // TODO: change this to ensure a different instance in every described test request
  beforeEach(async () => {
    // timeZone
    const timeZone = new TimeZone({ name: 'Africa/Accra', offset: 2 });
    savedTimeZone = await timeZone.save();
    // familyGroup
    familyGroup = new FamilyGroup({ name: faker.name.lastName(), timeZone: savedTimeZone });
    user = new User(mockedUser);

    // set user as group admin
    familyGroup.groupAdmins.push(user);

    user.familyGroups.push(familyGroup);
    familyGroup.users.push(user);
    savedFamilyGroup = await familyGroup.save();
    savedUser = await user.save();
  });

  describe('getFamilyGroups', () => {
    it('returns all family groups from authenticated user', async () => {
      // Sign up the user
      const userToAuthenticate = { name: userName(), email: email(), password: mockedPassword };
      req.body = userToAuthenticate;
      await authController.signUp(req, res, next);

      // Sign in the user
      req.body = { email: userToAuthenticate.email.toLowerCase(), password: mockedPassword };
      await authController.signIn(req, res, next);
      const { userId } = res._getData();

      // Assign family group to the user and assign the user to the family group
      familyGroup.users.push(userId);
      const createdFamilyGroup = await familyGroup.save();
      req.userId = userId;
      const foundUser = await User.findById(userId);
      foundUser.familyGroups.push(createdFamilyGroup);
      await foundUser.save();

      // Create Pet and add to group
      const pet = await Pet.create({
        name: 'Renata',
        birthdate: '2020-04-05',
        familyGroup: createdFamilyGroup
      });

      createdFamilyGroup.pets.push(pet);
      await createdFamilyGroup.save();

      const groupUsers = [
        { _id: savedUser._id, name: savedUser.name },
        { _id: foundUser._id, name: foundUser.name }
      ];

      // Test the controller request by authenticated user
      await getFamilyGroups(req, res, next);

      const data = res._getData();
      const responseGroup = JSON.stringify(data.groups);
      const expectedGroup = JSON.stringify([
        {
          id: createdFamilyGroup._id,
          name: createdFamilyGroup.name,
          users: groupUsers,
          pets: [{ _id: pet._id, name: pet.name }]
        }
      ]);

      expect(responseGroup).toBe(expectedGroup);
    });
  });

  describe('getFamilyGroup', () => {
    describe("when accessing user's family group", () => {
      it('returns the requested family group', async () => {
        req.userId = savedUser._id;
        req.params.groupId = savedFamilyGroup._id;
        await getFamilyGroup(req, res, next);
        expect(res._getData()._id).toStrictEqual(savedFamilyGroup._id);
        expect(res._getData()).toBeInstanceOf(FamilyGroup);
      });
    });
  });

  describe('createFamilyGroup', () => {
    describe('when user does not exist', () => {
      it('returns a not found message', async () => {
        req.userId = null;
        const mockedName = faker.name.lastName();
        req.body.name = mockedName;
        await createFamilyGroup(req, res, next);
        expect(res._getData().message).toBe('Usuario no encontrado');
      });
    });

    describe('when user creates a family group', () => {
      it('returns the created family group object', async () => {
        req.userId = savedUser._id;
        const mockedName = faker.name.lastName();
        req.body.name = mockedName;
        await createFamilyGroup(req, res, next);
        expect(res._getData().message).toBe('Grupo familiar creado con éxito');
        expect(res._getData().familyGroup).toHaveProperty('id');
        expect(res._getData().familyGroup).toHaveProperty('name', mockedName);
        expect(res._getData().familyGroup).toHaveProperty('users');
      });
    });
  });

  describe('updateFamilyGroup', () => {
    describe('when user updates family group', () => {
      it('returns updated family group', async () => {
        req.userId = savedUser._id.toString();
        req.params.groupId = savedFamilyGroup._id;
        const mockedName = faker.name.lastName(1);
        req.body = { name: mockedName, users: [savedUser._id], timeZone: savedTimeZone._id };
        await updateFamilyGroup(req, res, next);
        expect(res._getData().message).toBe('Grupo familiar actualizado con éxito');
        expect(res._getData().familyGroup).toHaveProperty('id');
        expect(res._getData().familyGroup).toHaveProperty('name', mockedName);
        expect(res._getData().familyGroup).toHaveProperty('users');
      });
    });
  });

  describe('destroyFamilyGroup', () => {
    describe('When group admin destroys a family group', () => {
      it('returns a successful destroyed message', async () => {
        req.userId = savedUser._id.toString();
        req.params.groupId = savedFamilyGroup._id;
        await destroyFamilyGroup(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getData().message).toBe('Grupo familiar eliminado con éxito');
      });
    });

    describe('When admin role destroys family group', () => {
      it('returns a successful destroyed message', async () => {
        const adminUser = new User({
          name: 'adminUser',
          email: 'admin@mail.cl',
          password: '123123',
          role: 'ADMIN'
        });
        savedFamilyGroup.users.push(adminUser);
        adminUser.familyGroups.push(savedFamilyGroup);

        await savedFamilyGroup.save();
        await adminUser.save();

        req.userId = adminUser._id.toString();
        req.params.groupId = savedFamilyGroup._id;

        await destroyFamilyGroup(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getData().message).toBe('Grupo familiar eliminado con éxito');
      });
    });

    describe('When basic user outside family group destroys family group', () => {
      it('returns an unathorized message', async () => {
        const basicUser = await User.create({
          name: 'basic user',
          email: 'basic@mail.com',
          password: 'basicpass'
        });
        req.userId = basicUser.id;
        req.params.groupId = savedFamilyGroup._id;

        await destroyFamilyGroup(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res._getData().message).toBe('No estás autorizado para realizar esta acción');
      });
    });
  });
});
