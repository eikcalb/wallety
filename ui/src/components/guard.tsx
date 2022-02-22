import React, { useContext } from "react"
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from "../lib"
import { Redirect, Route, useLocation, useHistory, RouteProps } from "react-router-dom"
import links from "../lib/links"

/**
 * HOC (high order component) for rendering private views only if the user is authenticated.
 * 
 * @param children View to render if authenticated
 */
export function AuthGuard({ children, ...rest }: RouteProps) {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const location = useLocation()

    return (
        <Route {...rest}>
            {ctx.signedIn() && viewCTX.signedIn ? (
                children
            ) : (
                    <Redirect to={{
                        pathname: links.login,
                        state: {
                            from: location
                        }
                    }} />
                )
            }
        </Route>
    )
}

/**
 * HOC for rendering components based on the authenticated state of the application.
 * This HOC is used for conditionally rendering authentication views (like login pages) or redirect if the user is already authenticated.
 * 
 * @param children View to render
 */
export function AuthHandler({ children }) {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const location = useLocation()

    if (ctx.signedIn() && viewCTX.signedIn) {
        const { from } = (location.state as any) || { from: { pathname: '/' } }
        return <Redirect to={from} />
    } else {
        return children
    }
}