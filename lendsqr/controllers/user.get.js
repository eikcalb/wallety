const auth = require("../lib/auth");

module.exports = async (req, res) =>
{
    try
    {
        const data = await auth.GetUser(req.userData.id)
        res.json({ message: 'User fetched successfully', data })
    } catch (e)
    {
        console.log(e)
        return res.status(500).json({ message: e.message || "Fetch failed" });
    }
};
