const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ======================================================
// Get all users
// ======================================================
const getUsers = (req, res) => {
    User.find({}, 'name email createdAt lastLogin birthdate avatarUrl role loginType', (err, users) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Could not load user',
                errors: err
            });
        }
        User.countDocuments({}, (err, size) => {
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

// ======================================================
// Update user
// ======================================================
const updateUser = (req, res) => {
    const id = req.params.id;
    const body = req.body;

    User.findById(id, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'User search failed ',
                errors: err
            })
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: `The user id: ${ id } not found`
            })
        }
        userDB.name = body.name; // required
        userDB.email = body.email; // required
        userDB.birthdate = body.birthdate;
        userDB.avatarUrl = body.avatarUrl;
        userDB.role = body.role; // required


        userDB.save((err, userSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error trying to update user',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                msg: 'User updated',
                user: {
                    name: userSave.name,
                    email: userSave.email,
                    birthdate: userSave.birthdate,
                    avatarUrl: userSave.avatarUrl,
                    role: userSave.role

                },

            })
        })
    })
}

// ======================================================
// Create user
// ======================================================
const createUser = async(req, res) => {
    const body = req.body;
    const user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        birthdate: body.birthdate,
        avatarUrl: body.avatarUrl,
        role: body.role
    });

    await user.save((err, userSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error trying to create user',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            msg: userSave
        })

    })
}

// ======================================================
// Delete user
// ======================================================
const deleteUser = async(req, res) => {
    const id = req.params.id;

    await User.findByIdAndDelete(id, (err, userDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'User search failed ',
                errors: err
            })
        }

        if (!userDelete) {
            return res.status(400).json({
                ok: false,
                msg: `The user id: ${ id } not found`
            })
        }

        res.status(200).json({
            ok: true,
            msg: 'User deleted',
            user: userDelete
        })

    })
}

module.exports = {
    getUsers,
    updateUser,
    createUser,
    deleteUser
};