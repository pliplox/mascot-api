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
        audience: cid
    });

    const payload = ticket.getPayload();
    console.log(payload);

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: 'GOOGLE',
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

    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'user search failed',
                errors: err
            })
        }

        if (userDB) {
            if (userDB.loginType !== 'GOOGLE') { // <- Duda
                return res.status(400).json({
                    ok: false,
                    msg: 'You must use your normal authentication'
                })
            } else {
                const token = jwt.sign({ user: userDB }, process.env.TOKEN_SECRET, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    msg: 'Login with google',
                    user: {
                        createAt: userDB.createdAt,
                        id: userDB.id,
                        name: userDB.name,
                        email: userDB.email,
                        avatarUrl: userDB.avatarUrl,
                        loginType: userDB.loginType,
                        avatarUrl: userDB.avatarUrl
                    },
                    token: token
                })
            }
        } else {
            const user = new User({
                name: googleUser.name,
                email: googleUser.email,
                avatarUrl: googleUser.img,
                loginType: googleUser.google,
                password: 'SECRET' //the real pass never saved in the Pliplox DB, but yes in the Google DB
            });

            user.save((err, userSave) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        msg: err
                    })
                }
                const token = jwt.sign({ user: userSave }, process.env.TOKEN_SECRET, { expiresIn: 14400 })
                return res.status(200).json({
                    ok: true,
                    msg: 'User saved in BD',
                    user: {
                        createAt: userSave.createdAt,
                        id: userSave.id,
                        name: userSave.name,
                        email: userSave.email,
                        avatarUrl: userSave.avatarUrl,
                        loginType: userSave.loginType
                    },
                    token: token

                })
            })

        }
    })
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
        // Verify passwords
        // ======================================================
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'The password isn´t correct'
            });
        }
        // ======================================================
        // Create token
        // ======================================================
        var token = jwt.sign({ user: userDB }, process.env.TOKEN_SECRET, { expiresIn: 14400 });
        // userDB.password = '';
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