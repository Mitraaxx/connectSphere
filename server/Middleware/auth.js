const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    let token = req.headers["authorization"];

    if (token) {
        token = token.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            req.user = decoded;
            next();
        });
    } else {
        return res.status(403).json({ message: "A token is required for authentication" });
    }
};

module.exports = verifyToken;