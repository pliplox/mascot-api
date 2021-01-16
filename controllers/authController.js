require('dotenv/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { registerValidation, loginValidation } = require('../validation');

const cid = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(cid);
const { User } = require('../models/User');

// seconds to expire token(4 hours)
const SIGN_IN_TIME_OUT = 14400;

// ======================================================
// Facebook Authentication
// ======================================================
const signInFacebook = async (req, res) => {
  const { user } = req;
  const userExist = await User.findOne({ email: user.emails[0].value });
  if (userExist) {
    const jwtoken = jwt.sign({ user: userExist }, process.env.TOKEN_SECRET, {
      expiresIn: SIGN_IN_TIME_OUT
    }); //  4 hours...
    return res.status(200).send({
      ok: true,
      message: 'Inicio de sesion con Facebook',
      user: {
        createAt: userExist.createdAt,
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        avatarUrl: userExist.avatarUrl,
        loginType: userExist.loginType
      },
      token: { jwtoken }
    });
  }

  const userFacebook = new User({
    name: `${user.name.familyName} ${user.name.givenName}`,
    email: user.emails[0].value,
    avatarUrl: user.photos[0].value,
    loginType: 'FACEBOOK',
    password: 'SECRET' // plain passwords are never saved in pliplox db
  });

  try {
    const savedUser = await userFacebook.save();
    const jwtoken = jwt.sign({ user: savedUser }, process.env.TOKEN_SECRET, {
      expiresIn: SIGN_IN_TIME_OUT
    }); //  4 hours...

    return res.status(200).send({
      ok: true,
      message: 'Usuario guardado',
      user: {
        createAt: savedUser.createdAt,
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        avatarUrl: savedUser.avatarUrl,
        loginType: savedUser.loginType
      },
      token: { jwtoken }
    });
  } catch (saveErr) {
    return res.status(400).json({
      ok: false,
      message: saveErr
    });
  }
};

// ======================================================
// Google Authentication
// ======================================================
const verify = async token => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: cid
  });

  const payload = ticket.getPayload();
  return {
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    loginType: 'GOOGLE'
  };
};

const signInGoogle = async (req, res) => {
  const { token } = req.body;
  const googleUser = await verify(token).catch(e => {
    return res.status(403).json({
      ok: false,
      message: ` Token no valido: ${e}`
    });
  });

  const userExist = await User.findOne({ email: googleUser.email });
  if (userExist) {
    const jwtoken = jwt.sign({ user: userExist }, process.env.TOKEN_SECRET, {
      expiresIn: SIGN_IN_TIME_OUT
    }); // 4 hours...

    return res.status(200).json({
      ok: true,
      message: 'Inicio de sesion con Google',
      user: {
        createAt: userExist.createdAt,
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        avatarUrl: userExist.avatarUrl,
        loginType: userExist.loginType
      },
      token: { jwtoken }
    });
  }
  const userGoogle = new User({
    name: googleUser.name,
    email: googleUser.email,
    avatarUrl: googleUser.img,
    loginType: googleUser.loginType,
    password: 'SECRET' // plain passwords are never saved in pliplox db
  });

  try {
    const savedUser = await userGoogle.save();
    const jwtoken = jwt.sign({ user: savedUser }, process.env.TOKEN_SECRET, {
      expiresIn: SIGN_IN_TIME_OUT
    }); // 4 hours...
    return res.status(200).send({
      ok: true,
      message: 'Usuario guardado',
      user: {
        createAt: savedUser.createdAt,
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        avatarUrl: savedUser.avatarUrl,
        loginType: savedUser.loginType
      },
      token: { jwtoken }
    });
  } catch (saveErr) {
    return res.status(400).json({
      ok: false,
      message: saveErr
    });
  }
};

// ======================================================
// Sign Up
// ======================================================
const signUp = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send({ ok: false, message: 'Email ya existe' });
  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;

  try {
    const savedUser = await user.save();
    return res.status(201).send({ message: 'Usuario creado con éxito', userId: savedUser._id });
  } catch (err) {
    return res.status(400).send(err);
  }
};

// ======================================================
// Normal Authentication
// ======================================================
const signIn = async (req, res) => {
  const { body } = req;
  const { error } = loginValidation(body);

  if (error) return res.status(400).send({ message: error.details[0].message });
  const userExist = await User.findOne({ email: body.email });

  // ======================================================
  // Verify email
  // ======================================================
  if (!userExist || !bcrypt.compareSync(body.password, userExist.password)) {
    return res.status(401).json({
      ok: false,
      message: `Correo electronico o contraseña incorrecta`
    });
  }

  // ======================================================
  // Create token
  // ======================================================
  const token = jwt.sign({ user: userExist }, process.env.TOKEN_SECRET, {
    expiresIn: SIGN_IN_TIME_OUT
  });
  return res.status(200).send({
    ok: true,
    userId: userExist.id,
    name: userExist.name,
    email: userExist.email,
    tokenId: token,
    expiresIn: 14400
  });
};

module.exports = {
  signUp,
  signIn,
  signInGoogle,
  signInFacebook
};
