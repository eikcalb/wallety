import React, { useContext, useEffect, useState } from 'react';
import { LoginView } from '../components/auth';
import { AuthHandler } from '../components/guard';
import { VIEW_CONTEXT } from '../lib';

export function Login() {
    const viewCTX = useContext(VIEW_CONTEXT)

    useEffect(() => {
        viewCTX.showToolbar(false)
        viewCTX.showFooter(false)

        return () => {
            viewCTX.showToolbar(true)
            viewCTX.showFooter(true)
        }
    })

    return (
        <AuthHandler>
            <div className='columns is-gapless is-fullheight is-multiline'>
                <div className='column is-flex-centered is-atleast-fullheight'>
                    <LoginView />
                </div>
                <div className='column is-6 is-hidden-touch is-flex has-background-info' />
            </div>
        </AuthHandler>
    )
}