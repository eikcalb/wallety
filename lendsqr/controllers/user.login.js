const auth = require("../lib/auth");

module.exports = async (req, res) =>
{
    try
    {
        const data = await auth.LoginUser(req.body.email?.trim(), req.body.password?.trim())
        res.json({ message: 'Logged in successfully', data })
    } catch (e)
    {
        console.log(e)
        return res.status(500).json({ message: e.message || "Auth failed" });
    }
};
