const auth = require("../lib/auth");

module.exports = async (req, res) =>
{
    try
    {
        await auth.CreateUser(req.body.username?.trim(), req.body.email?.trim(), req.body.password?.trim())
        res.json({ message: 'User created successfully' })
    } catch (e)
    {
        console.log(e)
        return res.status(500).json({ message: e.message || "Auth failed" });
    }
};

