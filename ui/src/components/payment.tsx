import React, { FormEventHandler, useContext, useEffect, useState } from 'react';
import { BsDownload, BsForward, BsUpload } from 'react-icons/bs';
import { FaMoneyBill, FaPenFancy, FaUserAlt } from 'react-icons/fa';
import { useToasts } from 'react-toast-notifications';
import { APPLICATION_CONTEXT } from '../lib';
import { fundAccount, TRANSACTION_TYPE, TRANSACTION_TYPE_MAP, transferFunds, withdrawFunds } from "../lib/payment";

const DEFAULT_FORM_STATE = {
    amount: '',
    narration: '',
    recipient: ''
}

export function PaymentPanel({ reload })
{
    const ctx = useContext(APPLICATION_CONTEXT)
    const [active, setActive] = useState<TRANSACTION_TYPE>(TRANSACTION_TYPE.fund)
    const [form, setForm] = useState<typeof DEFAULT_FORM_STATE>(DEFAULT_FORM_STATE)
    const [loading, setLoading] = useState(false)

    const { addToast } = useToasts()


    const onSubmit: FormEventHandler = async (e) =>
    {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        try
        {
            const amount = parseFloat(form.amount)
            let { narration, recipient } = form
            narration = narration.trim()
            recipient = recipient.trim()

            if (!amount || isNaN(amount) || (active === TRANSACTION_TYPE.transfer && !recipient))
            {
                throw new Error('All Fields are required')
            }

            switch (active)
            {
                case TRANSACTION_TYPE.fund:
                    await fundAccount(ctx, amount, narration)
                    break

                case TRANSACTION_TYPE.withdraw:
                    await withdrawFunds(ctx, amount, narration)
                    break

                case TRANSACTION_TYPE.transfer:
                    await transferFunds(ctx, amount, narration, recipient)
                    break
                default: throw new Error('Cannot process transaction')
            }
            addToast('Transaction Successful', { appearance: 'success' })
            await reload()
            setForm(DEFAULT_FORM_STATE)
        } catch (e)
        {
            console.log(e)
            addToast(e.message || 'Transaction failed', {
                appearance: 'error',
                autoDismiss: true,
            })
        } finally
        {
            setLoading(false)
        }
    }

    useEffect(() =>
    {
        setForm(DEFAULT_FORM_STATE)
    }, [active])

    return (
        <div className={`panel has-background-white-ter is-flex is-size-7 is-flex-direction-column`}>
            <div className='panel-heading is-flex is-vcentered pb-4 is-align-items-center is-flex-direction-column'>
                <p className='has-text-left is-size-6'>{TRANSACTION_TYPE_MAP[active]}</p>
                <div className='field is-grouped is-grouped-right'>
                    <p className='control'>
                        <button disabled={loading} title={TRANSACTION_TYPE_MAP[TRANSACTION_TYPE.fund]} className='button is-rounded is-success' onClick={() => setActive(TRANSACTION_TYPE.fund)}>
                            <span className='icon'>
                                <BsDownload />
                            </span>
                        </button>
                    </p>
                    <p className='control'>
                        <button disabled={loading} title={TRANSACTION_TYPE_MAP[TRANSACTION_TYPE.withdraw]} className='button is-rounded is-danger' onClick={() => setActive(TRANSACTION_TYPE.withdraw)}>
                            <span className='icon'>
                                <BsUpload />
                            </span>
                        </button>
                    </p>
                    <p className='control'>
                        <button disabled={loading} title={TRANSACTION_TYPE_MAP[TRANSACTION_TYPE.transfer]} className='button is-rounded is-link' onClick={() => setActive(TRANSACTION_TYPE.transfer)}>
                            <span className='icon'>
                                <BsForward />
                            </span>
                        </button>
                    </p>
                </div>
            </div>
            <div className='has-background-white' style={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
                <form className='my-4 px-6' onSubmit={onSubmit}>
                    {active === TRANSACTION_TYPE.transfer ?
                        <div className='field'>
                            <div className='control has-icons-left '>
                                <input disabled={loading} required value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder='enter recipient email' className='input' type='email' />
                                <span className='icon is-left is-small'><FaUserAlt /></span>
                            </div>
                        </div>
                        : null}
                    <div className='field'>
                        <div className='control has-icons-left '>
                            <input disabled={loading} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder='enter amount' className='input' type='number' min={100} />
                            <span className='icon is-left is-small'><FaMoneyBill /></span>
                        </div>
                    </div>
                    <div className='field'>
                        <div className='control has-icons-left '>
                            <input disabled={loading} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} placeholder='narration (optional)' className='input' type='text' />
                            <span className='icon is-left is-small'><FaPenFancy /></span>
                        </div>
                    </div>

                    <div className='field mt-6'>
                        <div className='control'>
                            <button disabled={loading} className={`button is-rounded is-fullwidth is-uppercase is-success ${loading ? 'is-loading' : ''}`} type='submit'>Done</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
