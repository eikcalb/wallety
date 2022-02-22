import React, { FormEventHandler, useCallback, useContext, useState } from 'react';
import { FaEnvelope, FaEye, FaEyeSlash, FaKey, FaSignInAlt, FaUser, FaUserPlus } from 'react-icons/fa';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { APPLICATION_CONTEXT, ILogin, IRegister, VIEW_CONTEXT } from '../lib';
import links from '../lib/links';
import logo from "../logo_runner.jpg";

export function RegisterView()
{
    const ctx = useContext(APPLICATION_CONTEXT)
    const [state, setState] = useState({
        showPassword: false,
        showPasswordVerify: false,
        loading: false,
    })
    const [formState, setFormState] = useState<IRegister>({
        email: '',
        password: '',
        password_verify: '',
        username: ''
    })

    const { addToast } = useToasts()
    const history = useHistory()
    const location = useLocation()

    const onSubmit: FormEventHandler = useCallback(async (e) =>
    {
        e.preventDefault()
        e.stopPropagation()

        setState({ ...state, loading: true })

        try
        {
            await ctx.addAdmin(formState)

            addToast('User registered successfully!', {
                appearance: 'success'
            })
            history.push(links.login, location.state)
        } catch (e)
        {
            console.log(e)
            addToast(e.message || 'Failed to add new user!', {
                appearance: 'error'
            })
        } finally
        {
            setState({ ...state, loading: false })
        }
    }, [state, formState])


    return (
        <div className='section'>
            <figure className='image is-96x96 is-flex' style={{ margin: 'auto' }}>
                <img src={logo} className='is-rounded' />
            </figure>

            <p className='help mb-4 has-text-weight-bold'>{ctx.config.description}</p>

            <form className='my-2' onSubmit={onSubmit}>

                <div className='field'>
                    <div className='control has-icons-left '>
                        <input autoComplete="nickname" disabled={state.loading} required value={formState.username} onChange={(e) => setFormState({ ...formState, username: e.target.value })} placeholder='enter username' className='input' type='text' />
                        <span className='icon is-left is-small'><FaUser /></span>
                    </div>
                </div>
                <div className='field'>
                    <div className='control has-icons-left '>
                        <input autoComplete="off" disabled={state.loading} required value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} placeholder='enter your email address' className='input' type='email' />
                        <span className='icon is-left is-small'><FaEnvelope /></span>
                    </div>
                </div>

                <div className='field is-horizontal'>
                    <div className='field-body'>
                        <div className='field has-addons'>
                            <div className='control has-icons-left is-expanded'>
                                <input autoComplete="off" disabled={state.loading} required value={formState.password} onChange={(e) => setFormState({ ...formState, password: e.target.value })} placeholder='enter your password' className='input' type={state.showPassword ? 'text' : 'password'} />
                                <span className='icon is-left is-small'><FaKey /></span>
                            </div>
                            <div className='control'>
                                <button className='button' type='button' onClick={(e) => setState({ ...state, showPassword: !state.showPassword })}>{state.showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className='field has-addons'>
                            <div className='control has-icons-left is-expanded'>
                                <input autoComplete="off" disabled={state.loading} required value={formState.password_verify} onChange={(e) => setFormState({ ...formState, password_verify: e.target.value })} placeholder='re-enter your password' className='input' type={state.showPasswordVerify ? 'text' : 'password'} />
                                <span className='icon is-left is-small'><FaKey /></span>
                            </div>
                            <div className='control'>
                                <button className='button' type='button' onClick={(e) => setState({ ...state, showPasswordVerify: !state.showPasswordVerify })}>{state.showPasswordVerify ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                <div className='field mt-6'>
                    <div className='control'>
                        <button disabled={state.loading} className={`button is-rounded is-fullwidth is-uppercase is-success ${state.loading ? 'is-loading' : ''}`} type='submit'>
                            <FaUserPlus />&nbsp; Register
                        </button>
                    </div>
                </div>
            </form>

            <div className='section mt-6 is-size-7'>
                <p>Already have an account?</p>
                <Link to={links.login}>Click here to login</Link>
            </div>
        </div>
    )

}


export function LoginView()
{
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const [loading, setLoading] = useState(false)
    const [state, setState] = useState<ILogin>({
        email: '',
        password: '',
        showPassword: false,
    })

    /**
     * Called to login to application
     */
    const onSubmitVerified = useCallback(async (form: ILogin) =>
    {
        setLoading(true)

        try
        {
            const user = await ctx.login(form.email, form.password)

            if (!user)
            {
                throw new Error('Failed to login!')
            }

            addToast('Login successful!', {
                appearance: 'success'
            })
            setLoading(false)
            return true
        } catch (e)
        {
            console.log(e)
            addToast(e.message || 'Login failed!', {
                appearance: 'error'
            })
            setLoading(false)
            return false
        }
    }, [state])

    const onSubmitForm: FormEventHandler = useCallback(async (e) =>
    {
        e.preventDefault()
        e.stopPropagation()

        await onSubmitVerified(state)
    }, [state])

    const { addToast } = useToasts()


    return (
        <div className='section'>
            <figure className='image is-96x96 is-flex' style={{ margin: 'auto' }}>
                <img src={logo} className='is-rounded' />
            </figure>

            <p className='help my-4 has-text-weight-bold'>{ctx.config.description}</p>
            <form onSubmit={onSubmitForm} >
                <div className='field'>
                    <div className='control has-icons-left'>
                        <input autoComplete="off" disabled={loading} required value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} placeholder='enter your email address' className='input' type='email' />
                        <span className='icon is-left is-small'><FaEnvelope /></span>
                    </div>
                </div>
                <div className='field has-addons'>
                    <div className='control has-icons-left is-expanded'>
                        <input autoComplete="off" disabled={loading} required value={state.password} onChange={(e) => setState({ ...state, password: e.target.value })} placeholder='enter your password' className='input' type={state.showPassword ? 'text' : 'password'} />
                        <span className='icon is-left is-small'><FaKey /></span>
                    </div>
                    <div className='control'>
                        <button className='button' type='button' onClick={(e) => setState({ ...state, showPassword: !state.showPassword })}>{state.showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <div className='field mt-6'>
                    <div className='control buttons is-centered'>
                        <button disabled={loading} className={`button is-rounded is-uppercase is-success ${loading ? 'is-loading' : ''}`} type='submit'>
                            <FaSignInAlt />&nbsp; Login
                        </button>
                    </div>
                </div>
            </form>
            <div className='section mt-6 is-size-7'>
                <p>Are you a new user?</p>
                <Link to={links.register}>Register</Link>
            </div>
        </div>
    )
}