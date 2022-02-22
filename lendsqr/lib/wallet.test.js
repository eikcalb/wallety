
const mockDBMethods = {
    count: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
}

const database = {
    db: () => mockDBMethods
}
database.db.transaction = jest.fn()

jest.mock('./database', () => database)

const wallet = require("./wallet")

const amount = 200000
let dbObject = {
    user: {
        id: 1,
        email: 'abc@example.com',
        username: 'eikcalb',
    },
    wallet: {
        balance: 9900000
    }
}

describe('wallet', () =>
{

    beforeEach(() =>
    {
        dbObject = {
            user: {
                id: 1,
                email: 'abc@example.com',
                username: 'eikcalb',
            },
            wallet: {
                balance: 9900000
            }
        }

        database.db.transaction.mockImplementation(async (callback) =>
        {
            await callback(database.db)
            return mockDBMethods
        })
    })

    describe('withdrawal', () =>
    {
        beforeEach(() =>
        {
            mockDBMethods.update.mockImplementation((update) =>
            {
                // Update only happens for the wallet
                dbObject.wallet.balance = update.balance
            })
        })

        afterEach(() =>
        {
            jest.clearAllMocks()
        })

        test('should update wallet balance', async () =>
        {
            mockDBMethods.first.mockReturnValueOnce({ count: 1 })
            mockDBMethods.first.mockReturnValueOnce(dbObject.wallet)

            const response = await wallet.Withdraw(dbObject.user.id, amount, 'withdrawal')

            expect(response).toBeDefined()
            expect(response).toEqual(dbObject.wallet.balance)
            expect(mockDBMethods.count).toHaveBeenCalled()
            // Call to add transaction
            expect(mockDBMethods.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
                narration: 'withdrawal',
                user: dbObject.user.id,
                amount,
            }))
            // Call to update wallet
            expect(mockDBMethods.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
                balance: response,
                previousBalance: response + amount
            }))
        })

        test('should fail if user does not exist', async () =>
        {
            mockDBMethods.first.mockReturnValue({ count: 0 })

            let actual

            try
            {
                await wallet.Withdraw(dbObject.user.id, amount, 'withdrawal')
            } catch (e)
            {
                actual = e
            }

            expect(actual).toEqual(new Error('User does not exist'))
        })
    })

    describe('fund', () =>
    {
        beforeEach(() =>
        {
            mockDBMethods.update.mockImplementation((update) =>
            {
                // Update only happens for the wallet
                dbObject.wallet.balance = update.balance
            })
        })

        afterEach(() =>
        {
            jest.clearAllMocks()
        })

        test('should update wallet balance', async () =>
        {
            mockDBMethods.first.mockReturnValueOnce({ count: 1 })
            mockDBMethods.first.mockReturnValueOnce(dbObject.wallet)

            const response = await wallet.Fund(dbObject.user.id, amount, 'fund')

            expect(response).toBeDefined()
            expect(response).toEqual(dbObject.wallet.balance)
            expect(mockDBMethods.count).toHaveBeenCalled()
            // Call to add transaction
            expect(mockDBMethods.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
                narration: 'fund',
                user: dbObject.user.id,
                amount,
            }))
            // Call to update wallet
            expect(mockDBMethods.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
                balance: response,
                previousBalance: response - amount
            }))
        })

        test('should fail if user does not exist', async () =>
        {
            mockDBMethods.first.mockReturnValue({ count: 0 })

            let actual

            try
            {
                await wallet.Fund(dbObject.user.id, amount, 'fund')
            } catch (e)
            {
                actual = e
            }

            expect(actual).toEqual(new Error('User does not exist'))
        })
    })

    describe('transfer', () =>
    {
        let recipient = {
            user: {
                id: 2,
                username: 'papi',
            },
            wallet: { balance: 0 }
        }

        beforeEach(() =>
        {
            mockDBMethods.update.mockImplementationOnce((update) =>
            {
                dbObject.wallet.balance = update.balance
            })
        })

        afterEach(() =>
        {
            jest.clearAllMocks()
        })

        test('should update wallet balance for sender and recipient', async () =>
        {
            mockDBMethods.where.mockImplementationOnce(() => mockDBMethods)
            mockDBMethods.where.mockImplementationOnce(async () => [recipient.user])
            mockDBMethods.first.mockReturnValueOnce({ count: 1 })
            mockDBMethods.first.mockReturnValueOnce(dbObject.wallet)
            mockDBMethods.first.mockReturnValueOnce(recipient.wallet)

            const response = await wallet.Transfer(dbObject.user.id, 'test2@example.com', amount, 'transfer')

            expect(response).toBeDefined()
            // Call to add transaction
            expect(mockDBMethods.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
                narration: 'transfer',
                user: dbObject.user.id,
                recipient: recipient.user.id,
                amount,
            }))
            // Call to update sender wallet
            expect(mockDBMethods.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
                balance: response,
                previousBalance: response + amount
            }))
            // Call to update recipient wallet
            expect(mockDBMethods.update).toHaveBeenNthCalledWith(2, expect.objectContaining({
                balance: recipient.wallet.balance + amount,
                previousBalance: recipient.wallet.balance
            }))
        })

        test('should fail if user does not exist', async () =>
        {
            mockDBMethods.first.mockReturnValue({ count: 0 })

            let actual

            try
            {
                await wallet.Transfer(dbObject.user.id, amount, 'fund')
            } catch (e)
            {
                actual = e
            }

            expect(actual).toEqual(new Error('User does not exist'))
        })

        test('should fail if recipient does not exist', async () =>
        {

            mockDBMethods.where.mockImplementationOnce(() => mockDBMethods)
            mockDBMethods.where.mockImplementationOnce(() => [])
            mockDBMethods.first.mockReturnValue({ count: 1 })

            let actual

            try
            {
                await wallet.Transfer(dbObject.user.id, amount, 'fund')
            } catch (e)
            {
                actual = e
            }

            expect(actual).toEqual(new Error('Recipient does not exist'))
        })
    })
})