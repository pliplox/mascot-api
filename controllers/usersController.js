const { User } = require('../models/User');

// ======================================================
// Get all users FIXME: This method should change the structure or whatever
// ======================================================
const getUsers = (req, res) => {
  User.find(
    {},
    'name email createdAt lastLogin birthdate avatarUrl role loginType',
    (err, users) => {
      if (err) {
        return res.status(500).send({
          ok: false,
          message: 'No se pudo cargar el usuario',
          errors: err
        });
      }

      User.countDocuments({}, (errCount, size) => {
        if (errCount) {
          return res.status(500).send({
            ok: false,
            message: 'Error al contar usuarios',
            errors: errCount
          });
        }

        return res.status(200).send({
          ok: true,
          total: size,
          users
        });
      });

      return 'ok'; // FIXME: this is momentary ... pending MB
    }
  );
};

// ======================================================
// Update user
// ======================================================
const updateUser = (req, res) => {
  const { id } = req.params;
  const { body } = req;

  User.findById(id, (findErr, userDB) => {
    if (findErr) {
      return res.status(500).json({
        ok: false,
        message: 'Error en la búsqueda del usuario',
        errors: findErr
      });
    }

    if (!userDB) {
      return res.status(400).json({
        ok: false,
        message: `El usuario con ID: ${id} no encontrado`
      });
    }

    if (userDB.loginType !== 'NORMAL') {
      return res.status(400).json({
        ok: false,
        message: `El tipo de cuenta: ${userDB.loginType} no se puede modificar`
      });
    }

    const us = new User({
      name: body.name, // require
      email: body.email, // require
      birthdate: body.birthdate,
      avatarUrl: body.avatarUrl,
      role: body.role, // require
      password: userDB.password
    });

    us.save((err, userSave) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: 'Error al intentar actualizar el usuario',
          errors: err
        });
      }

      return res.status(200).json({
        ok: true,
        message: 'Usuario actualizado',
        user: {
          id: userSave.id,
          name: userSave.name,
          email: userSave.email,
          birthdate: userSave.birthdate,
          avatarUrl: userSave.avatarUrl,
          role: userSave.role
        }
      });
    });
    return 'ok'; // FIXME: this is momentary ... pending MB
  });
};

// ======================================================
// Create user
// ======================================================
const createUser = async (req, res) => {
  const { name, email, password, birthdate, avatarUrl, role } = req.body;
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  user.birthdate = birthdate;
  user.avatarUrl = avatarUrl;
  user.role = role;

  await user.save((err, userSave) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: 'Error al intentar crear un usuario',
        errors: err
      });
    }

    return res.status(201).json({
      ok: true,
      message: userSave
    });
  });
};

// ======================================================
// Delete user
// ======================================================
// eslint-disable-next-line consistent-return
const deleteUser = async (req, res) => {
  const {
    params: { id },
    userId
  } = req;

  if (id === userId) {
    await User.findByIdAndDelete(id, (err, userDelete) => {
      if (err) {
        return res.status(500).send({
          ok: false,
          message: 'Error en la búsqueda del usuario',
          errors: err
        });
      }

      if (!userDelete) {
        return res.status(404).send({
          ok: false,
          message: `El usuario ID: ${id} no encontrado`
        });
      }

      return res.status(200).send({
        ok: true,
        message: 'Usuario eliminado',
        user: userDelete
      });
    });
  } else {
    return res.status(401).send({
      message: 'No estás autorizado para eliminar a este usuario'
    });
  }
};

module.exports = {
  getUsers,
  updateUser,
  createUser,
  deleteUser
};
