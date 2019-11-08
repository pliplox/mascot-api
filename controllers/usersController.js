const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { registerValidation } = require('../validation');

const signUp = async(req, res) => {
    const { error } =  registerValidation(req.body);
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
        return res.status(201).send({ userId: savedUser._id });
    } catch (err) {
        return res.status(400).send(err);
    }
};

const signIn = async(req, res) => {
    var body = req.body;

    await User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(404).json({
                ok: false,
                msg: 'user search failed',
                errors: err
            });
        }

        if (!userDB) {
            return res.status(401).json({
                ok: false,
                msg: `The ${body.email} isn´t correct`,
                errors: err
            });
        }

        // ======================================================
        // verificar contraseña
        // ======================================================
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'The password isn´t correct',
                errors: err
            });
        }
        // ======================================================
        // Crear un token 
        // ======================================================
        var token = jwt.sign({ user: userDB }, process.env.TOKEN_SECRET, { expiresIn: 14400 });
        userDB.password = '';
        res.status(200).json({
            ok: true,
            id: userDB.id,
            nombre: userDB.name,
            email: userDB.email,
            token: token

        });

    });
};

const getUsers = (req, res) => {
    User.find({}, 'name email createdAt lastLogin', (err, users) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Could not load user',
                errors: err
            });
        }
        User.count({}, (err, size) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error trying to count users',
                    errors: err
                })
            }

            return res.status(200).json({
                ok: true,
                total: size,
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