const { verify } = require("jsonwebtoken");

module.exports = async (req, res, next) =>
{
    try
    {
        if (!req.headers.authorization) throw new Error("AUTH FAILED");

        const token = req.headers?.authorization?.split(" ")[1];

        if (!token) return res.status(403).json({ error: "No token provided" });

        const decoded = verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error)
    {
        console.error(error.message);
        res.status(401).json({
            message: error.message,
        });
    }
};
