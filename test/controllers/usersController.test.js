const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const userController = require('../../controllers/usersController');
const User = require('../../models/User');
require('dotenv/config');

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
});

describe('Users Controller', () => {
  let connection;
  beforeAll(async () => {
    connection = await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('signUp', () => {
    it('signUp is a function', () => {
      expect(typeof userController.signUp).toBe('function');
    });

    describe('when user inputs invalid data', () => {
      const mockedUser = { name: 'name', email: 'emailtestcl', password: 'password' };
      const mockedUser2 = { name: 'Naruto', email: 'notemail', password: 'password ' };
      it('returns 400 status if name length is minor than 6', () => {
        req.body = mockedUser;
        userController.signUp(req, res, next);
        expect(res.statusCode).toBe(400);
      });

      it('returns an error message', () => {
        req.body = mockedUser2;
        userController.signUp(req, res, next);
        // to-do: here this should import the validates errors... or not (?)
        expect(res._getData()).toBe('"email" must be a valid email');
      });
    });

    describe('when user inputs valid data', () => {
      const mockedUser = { name: 'Cachupin', email: 'email@test.cl', password: 'password' };

      beforeEach(() => {
        req.body = mockedUser;
      });

      it('returns 201 status', async () => {
        await userController.signUp(req, res, next);
        expect(res.statusCode).toBe(201);
      });

      it('returns user id', async () => {
        await userController.signUp(req, res, next);
        const user = await User.findById(res._getData().userId);
        expect(res._getData().userId).toStrictEqual(user._id);
      });
    });

    // to-do: tests for signIn and getUsers
  });
});
