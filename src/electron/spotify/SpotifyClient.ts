import SpotifyCredentials from '../dto/SpotifyCredentials';
import {storage} from "../storage/Storage";
import utils from "../Utils";
import crypto from "crypto";
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

export const SPOTIFY_OAUTH_PROTOCOL = 'oauthspotify';

const SPOTIFY_REDIRECT_URI = SPOTIFY_OAUTH_PROTOCOL + '://callback'
const SPOTIFY_SCOPES = [
    'playlist-read-collaborative',
    'playlist-read-private',
    'user-library-read'
]
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_GRANT_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

// typeHint
interface SpotifyGrantResponse {
    access_token?: string,
    token_type?: string,
    expires_in?: number,
    refresh_token?: string,
    scope?: string
}

interface SpotifyResponse extends Object {

}

export class SpotifyApiError extends Error {
    url: string = null
    method: string = null
    status: number = null
    spotifyError: string = null
}

export default class SpotifyClient {

    code_verifier: string = null;

    getAuthUrl(): string {
        this.code_verifier = utils.base64_url_encode(crypto.randomBytes(32));
        const code_challenge = utils.base64_url_encode(crypto.createHash('sha256').update(this.code_verifier).digest())

        const params = {
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: SPOTIFY_SCOPES.join(' '),
            redirect_uri: SPOTIFY_REDIRECT_URI,
            code_challenge: code_challenge,
            code_challenge_method: 'S256',

        }

        return SPOTIFY_AUTH_URL + '?' + new URLSearchParams(params)
    }

    async authenticate(code: string) {
        const response = <AxiosResponse<SpotifyGrantResponse>>await axios.request({
            url: SPOTIFY_GRANT_URL,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: {
                client_id: process.env.SPOTIFY_CLIENT_ID,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: SPOTIFY_REDIRECT_URI,
                code_verifier: this.code_verifier
            },
        })

        const credentials = new SpotifyCredentials(
            response.data.access_token,
            response.data.refresh_token
        )
        this.code_verifier = null

        storage.setSpotifyCredentials(credentials)
        storage.saveSpotifyCredentials()
    }

    getMe(): Promise<SpotifyResponse> {
        return this.authenticatedRequest({
            url: SPOTIFY_API_URL + '/me'
        })
    }

    getMyPlaylists(params: object = {}): Promise<SpotifyResponse> {
        return this.authenticatedRequest({
            url: SPOTIFY_API_URL + '/me/playlists',
            params: params
        })
    }

    getMyTracks(params: object = {}): Promise<SpotifyResponse> {
        return this.authenticatedRequest({
            url: SPOTIFY_API_URL + '/me/tracks',
            params: params
        })
    }

    getPlaylistTracks(playlistId: string, params: object = {}): Promise<any> {
        return this.authenticatedRequest({
            url: SPOTIFY_API_URL + `/playlists/${playlistId}/tracks`,
            params: params
        })
    }

    private async authenticatedRequest<T>(options: AxiosRequestConfig): Promise<T> {
        const credentials = storage.getSpotifyCredentials()

        // stop here if there is no credentials
        if (!credentials || !credentials.accessToken) {
            throw new SpotifyApiError('Missing credentials - Try to authenticate on Spotify')
        }

        if (!options['method']) {
            options['method'] = 'get'
        }

        options['headers'] = {
            Authorization: `Bearer ${credentials.accessToken}`
        }

        try {
            const response = <AxiosResponse<T>>await axios.request(options)
            return response.data
        } catch (error) {
            throw this.wrapError(error, options)
        }
    }

    private wrapError(error: any, options: AxiosRequestConfig): Error {

        const apiError = new SpotifyApiError()
        apiError.url = options.url
        apiError.method = options.method
        apiError.message = `An error occurred while communicating with Spotify's Web API - ${error.message}`

        if (!(error instanceof AxiosError)) {
            return apiError
        }

        apiError.status = error.response ? error.response.status : null

        // try parse spotify response
        if (error.response
            && typeof error.response.data === 'object'
            && typeof error.response.data.error === 'object'
            && typeof error.response.data.error.message === 'string'
        ) {
            apiError.spotifyError = error.response.data.error.message
        }

        return apiError
    }

}

export const spotifyClient = new SpotifyClient();