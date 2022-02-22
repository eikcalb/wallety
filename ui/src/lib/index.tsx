import { createContext } from "react"
import validator from "validator"
import CONFIG from "./config"
import { initializeStorage, KEYS, localforage } from "./storage"
import { User } from "./user"

export class Application
{
    config: Config
    user?: User
    ready: Promise<boolean>

    logoutListener?: () => any
    loginListener?: () => any

    constructor(config: Config)
    {
        this.config = config
        this.ready = new Promise(async (res, rej) =>
        {
            try
            {
                await this.init()
                res(true)
            } catch (e)
            {
                // if an error occurred during initialization, throw the error and handle within the application
                console.log(e)
                return rej(e)
            }
        })
    }

    /**
     * Initialize application dependencies.
     * 
     * Dependencies that fail to load should fail silently at this stage, unless required for application to function.
     */
    async init()
    {
        await initializeStorage(this)
        // check for existing user session
        try
        {
            await this.inflateUser()
            // If user session exists, trigger login listener
            if (this.loginListener)
            {
                this.loginListener()
            }
        } catch (e)
        {
            console.log(e)
        }

        return true
    }


    signedIn(): boolean
    {
        return !!this.user && !!this.user?.token
    }

    async initiateNetworkRequest(path: string, request?: RequestInit, authenticated = false, isJson = true): Promise<Response>
    {
        const headers = {
            ...request?.headers,
            Accept: 'application/json',
            Authorization: authenticated ? `Bearer ${this.user?.token}` : request?.headers?.['Authorization'],
        }

        if (isJson)
        {
            headers['Content-Type'] = 'application/json'
        }

        const reqObj: RequestInit = {
            ...request,
            referrerPolicy: 'no-referrer',
            mode: 'cors',
            headers
        }

        const resp = await fetch(`${this.config.hostname}${path}`, reqObj)
        if (resp.status === 401)
        {
            if (!this.user)
            {
                throw new Error("Unauthenticated access not allowed!")
            }
            // Authorization failed. This usually means the token has expired and refresh token could not be used to regenerate token
            //
            // Try to reauthenticate the user
            try
            {
                const { token } = await this.reauthenticate()
                this.user.token = token
                // since token is generated already, retry the request
                if (reqObj && reqObj.headers && reqObj.headers['Authorization'])
                {
                    reqObj.headers['Authorization'] = `Bearer ${token}`
                }
                return await this.initiateNetworkRequest(path, reqObj)
            } catch (e)
            {
                await this.logout()
                throw e || new Error("App session expired. Login to continue!")
            }
        }
        return resp
    }

    protected async reauthenticate(): Promise<{ token: string }>
    {
        // No logic to reauthenticate. Throw error, forcing user to logout.
        throw new Error("Failed to authenticate user!")
    }

    protected async inflateUser()
    {
        // inflate user session
        let session: User | null = await localforage.getItem(KEYS.USER_SESSION)
        if (!session) throw new Error("No session available for user!")

        this.user = new User(session)
        return this.user
    }

    protected async persistUser()
    {
        if (!this.user)
        {
            throw new Error('No user created!')
        }

        await localforage.setItem(KEYS.USER_SESSION, this.user)
    }

    async updateUser()
    {
        if (!this.user)
        {
            throw new Error('Login to continue')
        }

        const response = await this.initiateNetworkRequest('/users/me', { method: 'GET' }, true)

        if (!response.ok)
        {
            throw new Error((await response.json())?.message || "Fetch failed!")
        }
        const { data } = await response.json()
        this.user.balance = data.balance;
        this.user.email = data.email
        this.user.username = data.username

        await this.persistUser()

        return this.user!
    }

    async login(email: string, password: string)
    {
        try
        {
            await this.validateLogin(email, password)

            const response = await this.initiateNetworkRequest('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })

            if (!response.ok)
            {
                throw new Error((await response.json())?.message || "Login failed!")
            }
            const { data } = await response.json()
            this.user = new User(data)

            await this.persistUser()
            if (this.loginListener)
            {
                this.loginListener()
            }

            return this.user
        } catch (e)
        {
            throw e
        }
    }

    protected async validateLogin(email: string, password: string)
    {
        if (!email || !password)
        {
            throw new Error("Credentials not provided!")
        }
        email = email.trim()

        if (!email || !validator.isEmail(email))
        {
            throw new Error("Invalid email provided!")
        }

        if (!validator.matches(password, /.{8,}/i))
        {
            throw new Error("Invalid password provided (Password must be at least 8 characters)!")
        }
    }

    async addAdmin(data: IRegister)
    {
        try
        {
            await this.validateRegister(data)
            const response = await this.initiateNetworkRequest('/users/create', {
                method: 'POST',
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password,
                })
            })
            if (!response.ok)
            {
                throw new Error((await response.json())?.message)
            }

            return await response.json()
        } catch (e)
        {
            throw e
        }
    }

    protected async validateRegister(data: IRegister)
    {
        let { email, password, password_verify, username } = data
        if (!email || !password)
        {
            throw new Error("Credentials not provided!")
        }
        if (password !== password_verify)
        {
            throw new Error('Passwords do not match!')
        }
        email = email.trim()
        if (!email || !validator.isEmail(email))
        {
            throw new Error("Invalid username provided!")
        }
        if (!validator.matches(password, /.{8,}/i))
        {
            throw new Error("Invalid password provided (Password must be at least 8 characters)!")
        }
    }

    async logout()
    {
        this.user = undefined
        await localforage.removeItem(KEYS.USER_SESSION)
        //await localforage.removeItem(KEYS.REFRESH_TOKEN)
        if (this.logoutListener)
        {
            this.logoutListener()
        }
    }
}

export const DEFAULT_APPLICATION = new Application(CONFIG)
/**
 * This is the application context used within the web application.
 * 
 * This context provided the application engine and is not tied to any view rendering.
 * 
 * The underlying aplication object exposes the required functions and do not modify the view.
 * This underlying object is made available to all React components via the application context.
 * 
 * All view rendering is managed in React.
 * 
 * **VIEW RENDERING SHOULD NOT DEPEND ON ANY PROPERTY OF THIS CONTEXT**
 */
export const APPLICATION_CONTEXT = createContext<Application>(DEFAULT_APPLICATION)

/**
 * This context is used for managing the views within the web app.
 * Activities such as loading and splashscreen are implemented using this context.
 */
export const VIEW_CONTEXT = createContext<{
    setSignedIn: any,
    signedIn: null | User,
    setAppReady: any,
    showToolbar: any,
    showFooter: any
}>({
    setSignedIn: (signedIn) => { },
    signedIn: null,
    setAppReady: (ready: boolean) => { },
    showToolbar: (show: boolean) => { },
    showFooter: (footer) => { }
})

export interface Config
{
    name: string
    version: string
    description: string
    hostname: string,
}

export interface IRegister
{
    username: string,
    email: string,
    password: string,
    password_verify: string,
}

export interface ILogin
{
    email: string,
    password: string,
    showPassword: boolean,
    loading?: boolean
}
