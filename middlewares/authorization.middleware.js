const Authorize = (permittedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (permittedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: `You are not allowed to access this route` });
        }
    };
};

module.exports = Authorize;
