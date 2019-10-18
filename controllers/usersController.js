const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { registerValidation } = require('../validation');

const signUp = async(req, res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save();
        return res.send({ userId: savedUser._id });
    } catch (err) {
        return res.status(400).send(err);
    }
};

// TO DO: implement signIn functionality with jwt
const signIn = (req, res) => {
    var body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: `user search failed`,
                errors: err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // ======================================================
        // verificar contraseña
        // ======================================================
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        // ======================================================
        // Crear un token 
        // ======================================================


        userDB.password = ':D' // setea carita para ocultar clave jiji

        // To-Do : Seed como variable de entorno ??
        var token = jwt.sign({ user: userDB }, process.env.SEED_JWT, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB.id
        });

    });
};

const getUsers = (req, res) => {
    User.find({}, 'name email createdAt lastLogin', (err, users) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'error cargando usuarios',
                errors: err
            });
        }
        User.count({}, (err, _count) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al intentar contar usuarios ???????????????',
                    errors: err
                })
            }

            return res.status(200).json({
                ok: true,
                total: _count,
                users: users
            });
        })
    });
}

module.exports = {
    signUp,
    signIn,
    getUsers
};