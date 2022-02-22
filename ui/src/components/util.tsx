import React, { useEffect } from 'react';

export function Loading()
{
    return (
        <section className='hero is-fullheight is-bold is-flex-centered' style={{ alignItems: 'stretch', padding: '2em' }}>
            <div className='hero-body is-flex-centered has-text-centered'>
                <div className='column is-4 is-12-mobile'>
                    <div className='section px-6'>
                        <progress className="progress is-small is-danger" max="100">loading</progress>
                    </div>
                </div>
            </div>
        </section>
    )
}
