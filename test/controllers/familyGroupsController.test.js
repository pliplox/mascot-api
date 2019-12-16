const httpMocks = require('node-mocks-http');
const faker = require('faker');
const familyGroupsController = require('../../controllers/familyGroupsController');
const FamilyGroup = require('../../models/FamilyGroup');
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
  beforeAll(async () => databaseHandler.connect());

  afterAll(async () => databaseHandler.close());

  afterEach(async () => databaseHandler.clearAll());

  describe('getFamilyGroups', () => {
    it('returns all family groups from authenticated user', async () => {
      req.body = mockedUser;
      await loginController.signUp(req, res, next);
      req.body = { email: mockedUser.email.toLowerCase(), password: mockedPassword };
      await loginController.signIn(req, res, next);
      const familyGroup = new FamilyGroup({ name: faker.name.lastName() });
      const { userId } = res._getData();
      familyGroup.users.push(userId);
      const savedFamilyGroup = await familyGroup.save();
      req.userId = userId;
      const user = await User.findById(userId);
      user.familyGroups.push(savedFamilyGroup);
      await user.save();
      await getFamilyGroups(req, res, next);
      expect(res._getData().length).toBeGreaterThan(0);
      expect(res._getData()).toEqual(
        expect.arrayContaining([{ id: savedFamilyGroup._id, name: savedFamilyGroup.name }])
      );
    });
  });

  describe('getFamilyGroup', () => {
    describe("when accessing user's family group", () => {
      it('returns the requested family group', async () => {
        const user = new User(mockedUser);
        const familyGroup = new FamilyGroup({ name: faker.name.lastName() });
        user.familyGroups.push(familyGroup);
        familyGroup.users.push(user);
        const savedUser = await user.save();
        const savedFamilyGroup = await familyGroup.save();
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
      beforeEach(async () => User.deleteMany({}));
      it('returns the created family group object', async () => {
        const user = new User(mockedUser);
        const savedUser = await user.save();
        req.userId = savedUser._id;
        const mockedName = faker.name.lastName();
        req.body.name = mockedName;
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
        const user = new User(mockedUser);
        const familyGroup = new FamilyGroup({ name: faker.name.lastName() });
        user.familyGroups.push(familyGroup);
        familyGroup.users.push(user);
        const savedUser = await user.save();
        const savedFamilyGroup = await familyGroup.save();
        req.userId = savedUser._id.toString();
        req.params.groupId = savedFamilyGroup._id;
        const mockedName = faker.name.lastName(1);
        req.body = { name: mockedName, users: [savedUser._id] };
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
      beforeEach(async () => User.deleteMany({}));
      it('returns a successful destroyed message', async () => {
        const user = new User(mockedUser);
        const familyGroup = new FamilyGroup({ name: faker.name.lastName() });
        user.familyGroups.push(familyGroup);
        familyGroup.users.push(user);
        await user.save();
        const savedFamilyGroup = await familyGroup.save();
        req.params.groupId = savedFamilyGroup._id;
        await destroyFamilyGroup(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getData().message).toBe('Family Group destroyed successfuly');
      });
    });
  });
});
