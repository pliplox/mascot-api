const jwt = require('jsonwebtoken');


// ======================================================
// Token verification
// ======================================================
exports.checkToken = (req, res, next) => {
    const token = req.query.token;
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                msg: 'Token invalid',
                errors: err
            });
        }
        req.user = decoded.user;
        next();
    });
};