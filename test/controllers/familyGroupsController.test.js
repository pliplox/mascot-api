const httpMocks = require('node-mocks-http');
const faker = require('faker');
const familyGroupsController = require('../../controllers/familyGroupsController');
const FamilyGroup = require('../../models/FamilyGroup');
const TimeZone = require('../../models/TimeZone');
const loginController = require('../../controllers/loginController');
const User = require('../../models/User');

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
  afterAll(async () => databaseHandler.close());

  afterEach(async () => databaseHandler.clearAll());

  let familyGroup;
  let savedTimeZone;
  let savedFamilyGroup;
  let savedUser;
  let user;

  beforeEach(async () => {
    databaseHandler.connect();

    // timeZone
    const timeZone = new TimeZone({ name: 'Africa/Accra', offset: 2 });
    savedTimeZone = await timeZone.save();

    // familyGroup
    familyGroup = new FamilyGroup({ name: faker.name.lastName(), timeZone: savedTimeZone });
    user = new User(mockedUser);

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
      await loginController.signUp(req, res, next);

      // Sign in the user
      req.body = { email: userToAuthenticate.email.toLowerCase(), password: mockedPassword };
      await loginController.signIn(req, res, next);
      const { userId } = res._getData();

      // Assign family group to the user and assign the user to the family group
      familyGroup.users.push(userId);
      const createdFamilyGroup = await familyGroup.save();
      req.userId = userId;
      const foundUser = await User.findById(userId);
      foundUser.familyGroups.push(createdFamilyGroup);
      await foundUser.save();

      // Test the controller request by authenticated user
      await getFamilyGroups(req, res, next);
      expect(res._getData().length).toBeGreaterThan(0);
      expect(res._getData()).toEqual(
        expect.arrayContaining([{ id: createdFamilyGroup._id, name: createdFamilyGroup.name }])
      );
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
    describe('when user creates a family group', () => {
      it('returns the created family group object', async () => {
        req.userId = savedUser._id;
        const mockedName = faker.name.lastName();
        req.body.name = mockedName;
        req.body.timeZoneId = savedTimeZone;
        await createFamilyGroup(req, res, next);
        expect(res._getData().message).toBe('Family Group created successfuly');
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
        expect(res._getData().message).toBe('Family Group updated successfuly');
        expect(res._getData().familyGroup).toHaveProperty('id');
        expect(res._getData().familyGroup).toHaveProperty('name', mockedName);
        expect(res._getData().familyGroup).toHaveProperty('users');
      });
    });
  });

  describe('destroyFamilyGroup', () => {
    describe('when user destroy a family group', () => {
      it('returns a successful destroyed message', async () => {
        req.params.groupId = savedFamilyGroup._id;
        await destroyFamilyGroup(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getData().message).toBe('Family Group destroyed successfuly');
      });
    });
  });
});
