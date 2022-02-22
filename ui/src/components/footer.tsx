import React, { useContext } from "react";
import { APPLICATION_CONTEXT } from "../lib";
import links from '../lib/links'
import { Link } from "react-router-dom";

export function Footer() {
    const ctx = useContext(APPLICATION_CONTEXT)

    return (
        <footer className='footer is-unselectable' >
            <div className="content has-text-centered is-size-7-touch">
                <p className="mb-0">{ctx.config.name} {new Date().getFullYear()}. All Rights Reserved</p>
                <p className="mt-1">&copy; Onome Agwa</p>
            </div>
        </footer>
    )
}