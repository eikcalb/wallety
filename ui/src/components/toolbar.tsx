import React, { useState, useContext, useCallback } from 'react'
import { STYLES } from '../lib/theme'
import { FaJoint, FaUser, FaContao, FaCog, FaSearch } from "react-icons/fa";
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from '../lib';
import { Link, NavLink } from 'react-router-dom';
import links from '../lib/links';
import logo from '../logo.jpg'

const AUTOHIDE_TIMEOUT = 20000
let timer: any

export default function Toolbar()
{
    const [state, setState] = useState({ showMenu: false })
    const ctx = useContext(APPLICATION_CONTEXT)
    const vctx = useContext(VIEW_CONTEXT)
    const toggleMenu = () =>
    {
        // Clear the existing timer for closing menu and then hide/show the menu
        clearTimeout(timer)
        if (state.showMenu)
        {
            setState({ ...state, showMenu: false })
        } else
        {
            setState({ ...state, showMenu: true })
            timer = setTimeout(() =>
            {
                setState({ ...state, showMenu: false })
            }, AUTOHIDE_TIMEOUT)
        }
    }

    return (
        <nav className='navbar' role='navigation' style={STYLES.toolbar} aria-label='main navigation'>
            <div className='navbar-brand'>
                <Link className='navbar-item' to={links.home}>
                    <img src={logo} width="44" height="28" />
                </Link>
                <a role="button" className={`navbar-burger burger ${state.showMenu ? 'is-active' : ''}`} aria-label="menu" aria-expanded="false" data-target="navbar" onClick={toggleMenu}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div className={`navbar-menu ${state.showMenu ? 'is-active' : ''}`} >
                <div className='navbar-end'>
                    <div className='navbar-item has-dropdown is-hoverable'>
                        <span className='navbar-link'>
                            {`${ctx.user?.username}`}
                        </span>
                        <div className='navbar-dropdown'>
                            <Link to={{ pathname: links.dashboard }} className='navbar-item'>Dashboard</Link>
                            <Link to={links.logout} className='navbar-item'>Sign Out</Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    )
}