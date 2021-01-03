const httpMocks = require('node-mocks-http');
const databaseHandler = require('../helpers/databaseHandler');
const { User } = require('../../models/User');

// controllers
const { signIn } = require('../../controllers/authController');
const { deleteUser } = require('../../controllers/usersController');

let req;
let res;
let next;

describe('Users Controller', () => {
  const mockFirstUserData = {
    name: 'Mandalorian',
    email: 'mandalorian@mail.com',
    password: '123123'
  };

  const mockSecondUserData = {
    name: 'Kung Fu',
    email: 'kungfu@mail.com',
    password: '123123'
  };

  let secondUser;

  beforeAll(async () => databaseHandler.openConnection());

  afterAll(async () => databaseHandler.closeConnection());

  afterEach(async () => databaseHandler.deleteCollections());

  beforeEach(async () => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = null;

    // Create the users
    const firstUser = new User(mockFirstUserData);
    await firstUser.save();

    secondUser = new User(mockSecondUserData);
  });

  describe('deleteUser', () => {
    describe('when deleting the signed user', () => {
      it('returns the deleted user', async () => {
        // Sign in the first user
        req.body = { email: mockFirstUserData.email, password: mockFirstUserData.password };
        await signIn(req, res, next);

        // Get the user's id
        const { userId } = res._getData();
        req.userId = userId;

        // delete the current user
        req.params.id = userId;
        await deleteUser(req, res, next);

        expect(res._getData().message).toBe('Usuario eliminado');
        expect(res.statusCode).toBe(200);
        expect(res._getData().user).toBeInstanceOf(User);

        // expects the user not to be in the database
        const findDeletedUser = await User.findById(userId);
        expect(findDeletedUser).toBeFalsy();
      });
    });

    describe('when deleting other user', () => {
      it('returns an unauthorized message', async () => {
        // Sign in the first user
        req.body = { email: mockFirstUserData.email, password: mockFirstUserData.password };
        await signIn(req, res, next);
        const { userId } = res._getData();
        req.userId = userId;

        // delete the second user
        await secondUser.save();

        req.params.id = secondUser.id;
        await deleteUser(req, res, next);

        expect(res._getData().message).toBe('No estás autorizado para eliminar a este usuario');
        expect(res.statusCode).toBe(401);

        // expects the user to be in the database
        const findDeletedUser = await User.findById(secondUser.id);
        expect(findDeletedUser).toBeInstanceOf(User);
      });
    });
  });
});
