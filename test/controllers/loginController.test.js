const httpMocks = require('node-mocks-http');
const loginController = require('../../controllers/loginController');
const User = require('../../models/User');
const databaseHandler = require('../helpers/databaseHandler');

let req;
let res;
let next;

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
      expect(typeof loginController.signUp).toBe('function');
    });

    describe('when user inputs invalid data', () => {
      const mockedUser = { name: 'name', email: 'emailtestcl', password: 'password' };
      const mockedUser2 = { name: 'Naruto', email: 'notemail', password: 'password ' };
      it('returns 400 status if name length is minor than 6', () => {
        req.body = mockedUser;
        loginController.signUp(req, res, next);
        expect(res.statusCode).toBe(400);
      });

      it('returns an error message', () => {
        req.body = mockedUser2;
        loginController.signUp(req, res, next);
        // to-do: here this should import the validates errors... or not (?)
        expect(res._getData()).toBe('"email" must be a valid email');
      });
    });

    describe('when user inputs valid data', () => {
      const mockedUser = { name: 'administrador', email: 'admin@admin.cl', password: 'password' };

      beforeEach(() => {
        req.body = mockedUser;
      });

      // this is needed because global afterEach not working between those "it"s below.
      // It may be caused due to asynchronous tasks.
      afterEach(async () => User.deleteMany());

      it('returns 201 status', async () => {
        await loginController.signUp(req, res, next);
        expect(res.statusCode).toBe(201);
      });

      it('returns user id', async () => {
        await loginController.signUp(req, res, next);
        const user = await User.findById(res._getData().userId);
        expect(res._getData().userId).toStrictEqual(user._id);
      });
    });
  });

  // ======================================================
  // SignIn TEST // TODO: standby
  // ======================================================
  describe('signIn', () => {
    it('singIn is a function', () => {
      expect(typeof loginController.signIn).toBe('function');
    });

    describe('when user inputs invalid data', () => {
      const mockedUser = { email: 'emailtestcaaaa' };
      const mockedUser2 = { email: 'test2test2cla', password: 'password' };
      it('return 400 status if user email invalid format', () => {
        req.body = mockedUser;
        loginController.signIn(req, res, next);
        expect(res.statusCode).toBe(400);
      });

      it('return an error message', () => {
        req.body = mockedUser2;
        loginController.signIn(req, res, next);
        expect(res._getData()).toBe('"email" must be a valid email');
      });
    });
  });
});
