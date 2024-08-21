const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

// Middleware to authenticate user for protected routes
const authenticate = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: `Token Not Found` });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: `Token Not Provided` });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: `Token Expired. Please Login Again.` });
        }

        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: `User Not Found` });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: `Invalid Token` });
    }
};

module.exports = authenticate;
