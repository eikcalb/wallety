const wallet = require("../lib/wallet");

module.exports = async (req, res) =>
{
    try
    {
        const balance = await wallet.Fund(
            req.userData.id,
            req.body.amount,
            req.body.narration?.trim() ?? "Funds deposit")

        res.json({ message: 'Funding completed successfully', balance })
    } catch (e)
    {
        console.log(e)
        return res.status(500).json({ message: e.message || "Funding failed" });
    }
};

