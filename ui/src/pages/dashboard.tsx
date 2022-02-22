import React, { useContext, useEffect, useState } from 'react';
import { FaEnvelope, FaUser, FaWallet } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { PaymentPanel } from '../components/payment';
import { APPLICATION_CONTEXT } from '../lib';
import links from '../lib/links';
import { TRANSACTION_TYPE } from '../lib/payment';
import logo from '../logo_runner.jpg';

const CurrencyFormatter = Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
})
/**
 * Profile component for viewing details of a user's profile. 
 */
export function Dashboard()
{
    const ctx = useContext(APPLICATION_CONTEXT)
    const [user, setUser] = useState({
        username: ctx.user?.username || '',
        email: ctx.user?.email || '',
        balance: ctx.user?.balance || 0,
    })

    const history = useHistory()

    if (!ctx.user)
    {
        if (history.length > 1)
        {
            history.goBack()
        }
        history.replace(links.logout)
    }

    const reload = () =>
    {
        ctx.updateUser().then(user =>
        {
            setUser({
                balance: user.balance,
                email: user.email,
                username: user.username,
            })
        })
            .catch(e => console.log(e))
    }

    useEffect(() =>
    {
        reload()
    }, [])

    return (
        <div className='is-1 is-variable px-3 py-3 my-0 is-fullheight is-multiline'>
            <div className='has-background-grey-dark' style={{
                height: '4em',
                width: '100%',
                borderRadius: '1em 1em 0 0',
                border: 'solid #dadada88 1px',
                borderBottom: 0
            }} />

            <div className='columns is-gapless is-clipped' style={{
                marginBottom: '0.8em',
                borderRadius: '0 0 1em 1em',
                border: 'solid #dadada88 1px',
                borderTop: 0,
                minHeight: '68%',
            }}>
                <div className='column is-4 is-flex is-flex-direction-column has-text-left is-align-items-stretch'>
                    <figure className='image is-flex is-96x96 is-align-self-center mt-4'>
                        <img className='is-rounded' src={logo} style={{ background: 'radial-gradient(#fff ,#3273dc 300% 4%)', border: 'solid #8884 0.1px', filter: 'grayscale(1)' }} />
                    </figure>
                    <div className='is-flex my-4 is-flex-direction-column px-5' style={{ justifyContent: 'space-between', alignItems: 'stretch', flexGrow: 1, position: 'relative' }}>
                        <div className='content has-text-left' style={{ position: 'relative', width: '100%' }}>
                            <p className='my-4 is-flex has-text-grey has-text-weight-bold is-size-4' style={{ alignItems: 'center' }}>
                                <span className='icon mr-2'><FaWallet /></span> &#x20A6;{CurrencyFormatter.format(user.balance / 100)}
                            </p>
                            <p className='mb-1 is-flex has-text-grey' style={{ alignItems: 'center' }}>
                                <span className='icon mr-2'><FaUser /></span>{user.username}
                            </p>
                            <p className='mb-1 is-flex has-text-grey' style={{ alignItems: 'center' }}>
                                <span className='icon mr-2'><FaEnvelope /></span>{user.email}
                            </p>
                        </div>
                    </div>
                </div>
                <div className='column is-8 is-flex is-flex-direction-column' style={{ alignItems: 'stretch', border: 'solid #dadada88 1px', }}>
                    <div className='content px-2 py-4 is-size-7 has-background-white is-flex is-flex-direction-column' style={{ justifyContent: 'flex-start', alignItems: 'stretch', flexGrow: 1, position: 'relative' }}>
                        <PaymentPanel reload={reload} />
                    </div>
                </div>
            </div>
        </div>
    )
}