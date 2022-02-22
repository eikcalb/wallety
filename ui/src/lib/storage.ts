import lf from "localforage";
import { Application } from ".";

export const KEYS = {
    USER_SESSION: 'app.user.session',
    REFRESH_TOKEN: 'app.user.refreshtoken',
    APP_DATA: 'app.data'
}

export async function initializeStorage(app: Application) {
    lf.config({
        driver: [
            lf.INDEXEDDB,
            lf.LOCALSTORAGE,
            lf.WEBSQL
        ],
        name: `${app.config.name} v${app.config.version}`,
        version: 1,
        storeName: 'adminstore',
        description: 'Storage for Contractor application administrative interface'
    })

    await lf.ready()
}

export const localforage = lf
