const wallet = require("../lib/wallet");

module.exports = async (req, res) =>
{
    try
    {
        const balance = await wallet.Transfer(
            req.userData.id,
            req.body.recipient?.trim(),
            req.body.amount,
            req.body.narration?.trim() || "Funds transfer")

        res.json({ message: 'Transfer completed successfully', balance })
    } catch (e)
    {
        console.log(e)
        return res.status(500).json({ message: e.message || "Transfer failed" });
    }
};

