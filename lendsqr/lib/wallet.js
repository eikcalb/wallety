const { v4 } = require('uuid')
const database = require('./database')

class Wallet
{
    static STATUS = {
        pending: 0,
        success: 1,
        failed: 2,
        reversed: 3,
    }
    static TRANSACTION_TYPE = {
        fund: 0,
        withdraw: 1,
        transfer: 2,
    }

    async Fund(userID, amount, narration)
    {
        const reference = v4()
        let updatedBalance = 0

        if (!amount)
        {
            throw new Error("Funding amount not specified")
        }
        if (amount < 100)
        {
            throw new Error('Cannot process transactions less than 100 NGN')
        }
        // Check if user already exists
        const rows = await database.db('users')
            .count({ count: 'username' })
            .where({ id: userID })
            .first()

        // If the user does not exist, fail the transaction.
        // If there are more than 1 users, fail the transaction...this should never happen.
        if (rows.count !== 1)
        {
            console.log(`${reference}: ${rows.count} user(s) found for transaction`)
            throw new Error('User does not exist')
        }

        await database.db.transaction(async txn =>
        {
            // Update transaction table and wallet balance
            const wallet = await txn('wallet')
                .select()
                .where({ userID })
                .first()

            if (!wallet)
            {
                throw new Error(`Cannot find wallet for user ${userID}`)
            }

            updatedBalance = wallet.balance + amount

            await txn('transaction')
                .insert({
                    narration, amount, reference,
                    user: userID,
                    status: Wallet.STATUS.success,
                    type: Wallet.TRANSACTION_TYPE.fund,
                })

            await txn('wallet')
                .where({ id: wallet.id })
                .update({
                    balance: updatedBalance,
                    previousBalance: wallet.balance,
                    lastTransactionReference: reference,
                })

            console.info(`${reference}: Successfully funded ${userID} with ${amount}`)
        })

        return updatedBalance
    }

    async Withdraw(userID, amount, narration)
    {
        const reference = v4()
        let updatedBalance = 0

        if (!amount)
        {
            throw new Error("Withdrawal amount not specified")
        }

        if (amount < 100)
        {
            throw new Error('Cannot process transactions less than 100 NGN')
        }
        // Check if user already exists
        const rows = await database.db('users')
            .count({ count: 'username' })
            .where({ id: userID })
            .first()

        // If the user does not exist, fail the transaction.
        // If there are more than 1 users, fail the transaction...this should never happen.
        if (rows.count !== 1)
        {
            console.log(`${reference}: ${rows.count} user(s) found for transaction`)
            throw new Error('User does not exist')
        }

        await database.db.transaction(async txn =>
        {
            const wallet = await txn('wallet')
                .select()
                .where({ userID })
                .first()

            if (!wallet)
            {
                throw new Error(`Cannot find wallet for user ${userID}`)
            }

            updatedBalance = wallet.balance - amount

            // Check if amount can be withdrawn
            if (amount > wallet.balance)
            {
                throw new Error(`Cannot process negative withdrawal`)
            }

            // Update transaction table and wallet balance
            await txn('transaction')
                .insert({
                    narration, amount, reference,
                    user: userID,
                    status: Wallet.STATUS.success,
                    type: Wallet.TRANSACTION_TYPE.withdraw,
                })

            await txn('wallet')
                .where({ id: wallet.id })
                .update({
                    balance: updatedBalance,
                    previousBalance: wallet.balance,
                    lastTransactionReference: reference,
                })

            console.info(`${reference}: Successfully processed withdrawal for ${userID} with ${amount}`)
        })

        return updatedBalance
    }

    async Transfer(userID, recipientEmail, amount, narration)
    {
        const reference = v4()
        let updatedBalance = 0

        if (!amount)
        {
            throw new Error("Transfer amount not specified")
        }
        if (amount < 100)
        {
            throw new Error('Cannot process transactions less than 100 NGN')
        }

        // Check if user already exists
        const user = await database.db('users')
            .count({ count: 'username' })
            .where({ id: userID })
            .first()

        // If the user does not exist, fail the transaction.
        // If there are more than 1 users, fail the transaction...this should never happen.
        if (user.count !== 1)
        {
            console.log(`${reference}: ${user.count} user(s) found for transaction`)
            throw new Error('User does not exist')
        }
        // Check if recipient exists
        const fetchedrecipients = await database.db('users')
            .select('id', 'username')
            .where({ email: recipientEmail })
        // If the user does not exist, fail the transaction.
        // If there are more than 1 users, fail the transaction...this should never happen.
        if (fetchedrecipients.length !== 1)
        {
            console.log(`${reference}: ${fetchedrecipients.length} recipient(s) found for transaction`)
            throw new Error('Recipient does not exist')
        }
        const [recipient] = fetchedrecipients
        if (recipient.id === userID)
        {
            console.log(`${reference}: ${recipient.id} attempt to make same account transfer`)
            throw new Error('Cannot make transfers to your account')
        }
        await database.db.transaction(async txn =>
        {
            const senderWallet = await txn('wallet')
                .select()
                .where({ userID })
                .first()

            if (!senderWallet)
            {
                throw new Error(`Cannot find wallet for user ${userID}`)
            }

            updatedBalance = senderWallet.balance - amount

            const recipientWallet = await txn('wallet')
                .select()
                .where({ userID: recipient.id })
                .first()

            if (!recipientWallet)
            {
                throw new Error(`Cannot find wallet for recipient ${recipient.id}`)
            }

            // Check if amount can be transferred
            if (amount > senderWallet.balance)
            {
                throw new Error(`Cannot process negative transfer`)
            }

            // Update transaction table and wallet balance
            await txn('transaction')
                .insert({
                    narration, amount, reference,
                    recipient: recipient.id,
                    user: userID,
                    status: Wallet.STATUS.success,
                    type: Wallet.TRANSACTION_TYPE.transfer,
                })

            await txn('wallet')
                .where({ id: senderWallet.id })
                .update({
                    balance: updatedBalance,
                    previousBalance: senderWallet.balance,
                    lastTransactionReference: reference,
                })

            await txn('wallet')
                .where({ id: recipientWallet.id })
                .update({
                    balance: recipientWallet.balance + amount,
                    previousBalance: recipientWallet.balance,
                    lastTransactionReference: reference,
                })

            console.info(`${reference}: Successfully processed transfer for ${userID} to ${recipient.username} (${recipient.id}) with ${amount}`)
        })

        return updatedBalance
    }
}

module.exports = new Wallet()