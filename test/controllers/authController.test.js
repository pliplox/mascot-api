const httpMocks = require('node-mocks-http');
const faker = require('faker');
const authController = require('../../controllers/authController');
const User = require('../../models/User');
const databaseHandler = require('../helpers/databaseHandler');

let req;
let res;
let next;
const mockedPassword = '123123';
const {
  internet: { userName, email }
} = faker;
const mockedUser = { name: userName(), email: email(), password: mockedPassword };
const mockeduserSignin = { email: email(), password: mockedPassword };

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
});

describe('Login Controller', () => {
  beforeAll(async () => databaseHandler.connect());

  afterAll(async () => databaseHandler.close());

  afterEach(async () => databaseHandler.clearAll());

  // ======================================================
  // SingUp TEST
  // ======================================================
  describe('signUp', () => {
    it('signUp is a function', () => {
      expect(typeof authController.signUp).toBe('function');
    });

    describe('when user inputs invalid data', () => {
      it('returns status 400 if name length is minor than 6', () => {
        const mockedUser1 = { name: 'name', email: email(), password: mockedPassword };
        req.body = mockedUser1;
        authController.signUp(req, res, next);
        expect(res.statusCode).toBe(400);
      });

      it('returns an error message', () => {
        const mockedUser2 = { name: 'Naruto', email: 'it is not email', password: mockedPassword };
        req.body = mockedUser2;
        authController.signUp(req, res, next);
        // to-do: here this should import the validates errors... or not (?)
        expect(res._getData()).toBe('"email" must be a valid email');
      });
    });

    describe('when user inputs valid data', () => {
      beforeEach(async () => {
        req.body = mockedUser;
      });

      it('returns status 201', async () => {
        await authController.signUp(req, res, next);
        expect(res.statusCode).toBe(201);
      });

      it('returns user id', async () => {
        await authController.signUp(req, res, next);
        const user = await User.findById(res._getData().userId);
        expect(res._getData().userId).toStrictEqual(user._id);
      });
    });
  });

  // ======================================================
  // SignIn TEST
  // ======================================================
  describe('signIn', () => {
    beforeEach(async () => {
      await User.deleteMany({});
    });

    it('singIn is a function', () => {
      expect(typeof authController.signIn).toBe('function');
    });

    describe('Invalid email', () => {
      it('returns status 400', () => {
        const mockedUser1 = { email: 'it is not email', password: mockedPassword };
        req.body = mockedUser1;
        authController.signIn(req, res, next);
        expect(res.statusCode).toBe(400);
      });
    });

    describe('when user inputs invalid data', () => {
      it('returns an error message', () => {
        const mockedUser2 = { email: 'test2test2cla', password: mockedPassword };
        req.body = mockedUser2;
        authController.signIn(req, res, next);
        expect(res._getData()).toBe('"email" must be a valid email');
      });
    });

    describe('when user inputs valid data', () => {
      beforeEach(() => {
        req.body = mockeduserSignin;
      });

      it('returns status 200', async () => {
        authController.signIn(req, res, next);
        expect(res.statusCode).toBe(200);
      });
    });
  });
});
