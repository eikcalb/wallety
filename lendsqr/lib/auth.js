const crypto = require('crypto')
const { sign } = require('jsonwebtoken')
const validator = require('validator')
const database = require('./database')

class Auth
{
    passwordRegExp = /^[a-zA-Z0-9@$_*&]{8,}$/

    async generateHash(password)
    {
        // https://nodejs.org/api/crypto.html#using-strings-as-inputs-to-cryptographic-apis
        password = password.normalize('NFC')
        return new Promise((resolve, reject) =>
        {
            crypto.scrypt(Buffer.from(password), Buffer.from(process.env.PASSWORD_KEY), 64, { cost: 2048 }, (err, key) =>
            {
                if (err)
                {
                    return reject(err)
                }

                return resolve(key.toString('hex'))
            })
        })
    }

    async CreateUser(username, email, rawPassword)
    {
        if (!email || !validator.isEmail(email) || validator.isEmpty(username) || !validator.matches(rawPassword, this.passwordRegExp))
        {
            throw new Error('Invalid data provided')
        }
        // Check if user already exists
        const rows = await database.db('users')
            .count({ count: 'username' })
            .where({ email })
            .first()

        if (rows.count > 0)
        {
            throw new Error('Email has already been used')
        }

        // If new user, create user in DB
        const password = await this.generateHash(rawPassword)
        return await database.db.transaction(async txn =>
        {
            await txn('users')
                .insert({ username, email, password })

            const user = await txn('users')
                .select('id')
                .where({ email })
                .first()

            await txn('wallet')
                .insert({ userID: user.id, active: true })
        })
    }

    async LoginUser(email, rawPassword)
    {
        if (!email || !validator.isEmail(email) || !validator.matches(rawPassword, this.passwordRegExp))
        {
            throw new Error('Invalid data provided')
        }

        // Fetch first user with matching email
        // There should really be only one user available
        const user = await database.db('users')
            .leftJoin('wallet', 'wallet.userID', 'users.id')
            .select({
                id: 'users.id', username: 'users.username', email: 'users.email', password: 'users.password', balance: 'wallet.balance'
            })
            .where({ email })
            .first()

        // Compare passwrd hash
        const password = await this.generateHash(rawPassword)
        if (!user || password !== user.password)
        {
            throw new Error('Failed to authenticate user')
        }
        delete user.password

        return {
            ...user,
            token: sign(user, process.env.JWT_KEY, {
                expiresIn: '1h'
            }),
        }
    }

    async GetUser(id)
    {
        // Fetch first user with matching email
        // There should really be only one user available
        const user = await database.db('users')
            .leftJoin('wallet', 'wallet.userID', 'users.id')
            .select({
                id: 'users.id', username: 'users.username', email: 'users.email', password: 'users.password', balance: 'wallet.balance'
            })
            .where({ 'users.id': id })
            .first()

        return user
    }
}

module.exports = new Auth()