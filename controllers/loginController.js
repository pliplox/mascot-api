const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');
const { OAuth2Client } = require('google-auth-library');

// ======================================================
// Google Authentication
// ======================================================
const cid = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(cid);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: cid // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload(); //all user information
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    console.log(payload);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
}

const signInGoogle = async(req, res) => {
    let token = req.body.token;
    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                msg: 'Invalid token'
            });
        });

    res.status(200).json({
        ok: true,
        msg: 'Correct petition',
        googleUser: googleUser
    });
};

// ======================================================
// Normal Authentication
// ======================================================
const signUp = async(req, res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists');

    // ======================================================
    // Hash the password
    // ======================================================
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
                msg: `The ${body.email} isn´t correct`
            });
        }

        // ======================================================
        // verificar contraseña
        // ======================================================
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'The password isn´t correct'
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


module.exports = {
    signUp,
    signIn,
    signInGoogle

};