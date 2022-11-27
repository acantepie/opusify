import {app, BrowserWindow, ProtocolRequest, ProtocolResponse} from "electron";
import * as url from "url";
import {spotifyClient} from "./SpotifyClient";
import {windowManager} from "../WindowManager";
import {IpcEvents} from "../ipc/IpcEvents";
import Utils from "../Utils";
import {join} from "path";
import {logger} from "../Logger";

class SpotifyOAuthHandler {

    async login(): Promise<void> {
        if (windowManager.exists('oauth')) {
            console.warn('Oauth login prevented.')
            return
        }

        const authWindow = new BrowserWindow({
            width: 800,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        })
        authWindow.setMenu(null)
        authWindow.on('closed', () => {
            windowManager.send('main', IpcEvents.SPOTIFY_LOGIN_DONE)
        })

        windowManager.addWindow('oauth', authWindow)

        try {
            await authWindow.loadURL(spotifyClient.getAuthUrl())
        } catch (err: any) {
            return this._renderError(err.message)
        }
    }

    async handleLoginRequest(protocolRequest: ProtocolRequest, respond: (response: ProtocolResponse) => void): Promise<void> {
        const queryParams: SpotifyOauthQueryParams = url.parse(protocolRequest.url, true).query

        if (queryParams.error) {
            return this._renderError('Spotify return an error :' + queryParams.error)
        }

        if (!queryParams.code) {
            return this._renderError('Invalid callback')
        }

        try {
            await spotifyClient.authenticate(queryParams.code)
            return this._renderSuccess()
        } catch (err: any) {
            return this._renderError(err.message)
        }
    }

    private async _renderSuccess(): Promise<void> {
        const win = windowManager.getWindow('oauth')
        if (win) {
            if (app.isPackaged) {
                return win.loadFile(join(process.env.DIST, 'oauth_success.html'))
            } else {
                return win.loadURL(process.env.VITE_DEV_SERVER_URL + 'oauth_success.html')
            }
        }
    }

    private async _renderError(error: string): Promise<void> {
        logger.error('[Spotify oauth] Unable to handle oauth')
        logger.error(error)

        const win = windowManager.getWindow('oauth')
        if (win) {
            if (app.isPackaged) {
                await win.loadFile(join(process.env.DIST, 'oauth_error.html'))
            } else {
                await win.loadURL(process.env.VITE_DEV_SERVER_URL + 'oauth_error.html')
            }

            const htmlError = Utils.escape_quote(Utils.nl2br(error))
            return win.webContents.executeJavaScript(`document.getElementById('error').innerHTML = "${htmlError}"`)
        }
    }
}

export const spotifyOAuthHandler = new SpotifyOAuthHandler()