import React, { useContext, useEffect, useLayoutEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from '../lib';

export function Logout()
{
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)


    useEffect(() =>
    {
        viewCTX.setAppReady(false)
        viewCTX.showToolbar(false)
        ctx.logout()

        return () =>
        {
            viewCTX.showToolbar(true)
            viewCTX.setAppReady(true)
        }
    }, [])

    if (!viewCTX.signedIn)
    {
        return <Redirect to={{ pathname: '/' }} />
    }



    return (
        viewCTX.signedIn ? <></> : <Redirect to={{ pathname: '/' }} />
    )
}