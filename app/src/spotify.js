import axios from "axios";

const LOCALSTORAGE_KEYS = {
    accessToken: 'spotify_access_token',
    refreshToken: 'spotify_refresh_token',
    expireTime: 'spotify_token_expire_time',
    timestamp: 'spotify_token_timestamp',
}

const LOCALSTORAGE_VALUES = {
    accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
    refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
    expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
    timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
}

const hasTokenExpired = () => {
    const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;

    if (!accessToken || !timestamp) { return false; }

    const millisecondsElapsed = Date.now() - Number(timestamp);
    return (millisecondsElapsed / 1000) > Number(expireTime);
};

export const logout = () => {
    //clear all localstorage items
    for (const property in LOCALSTORAGE_KEYS) {
        window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
    }

    //navigate to homepage
    window.location = window.location.origin;
};

const refreshToken = async () => {
    try {
        //logout if there's no refresh token stored or we've managed to get into a reload infinite loop
        if (!LOCALSTORAGE_VALUES.refreshToken || LOCALSTORAGE_VALUES.refreshToken === 'undefined' || (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000) {
            console.error('No refresh token available');
            logout();
        }

        // use '/refresh_token endpoint from our Node app
        const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

        //update localstorage values
        window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.accessToken);
        window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

        //reload the page for localstorage updates to be reflected
        window.location.reload();
    } catch(e) {
        console.error(e);
    }
}

//handles retrieving spotify access token from local storage
const getAccessToken = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const queryParams = {
        [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
        [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
        [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
    }
    const hasError = urlParams.get('error');

    //if there's an error or the token in localstorage has expired, refresh the token
    if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
        refreshToken();
    }

    //if there is a valid access token in localstorage, use it
    if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
        return LOCALSTORAGE_VALUES.accessToken;
    }

    // if there is a token in the URL query params, user is logging in for the first time
    if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
        //store the query params in local storage
        for (const property in queryParams) {
            window.localStorage.setItem(property, queryParams[property]);
        }
    }

    //set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    //return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
}

export const accessToken = getAccessToken();

//axios global request headers
axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
axios.defaults.headers['Content-Type'] = 'application/json';


// Get current user's profile

export const getCurrentUserProfile = () => axios.get('/me');
export const getCurrentUserSavedTracks = () => axios.get('/me/tracks');
export const getCurrentUserPlaylists = () => axios.get('/me/playlists');
export const getUserPlaylists = (UID) => axios.get(`/users/${UID}/playlists`);
export const getPlaylistItems = (PID) => axios.get(`/playlists/${PID}/tracks`);
export const createPlaylist = (UID) => axios.post(`/users/${UID}/playlists`, {
    name: 'Duality'
});
export const addPlaylistItems = (PID, tracks) => axios.post(`/playlists/${PID}/tracks`, {
    //uris: tracks
    uris: tracks
})
//export const getSpecifiedUserPlaylist = () => axios.get('/users/{user_id}/playlists);
//get track /tracks/{id}
//get several tracks /tracks (comma separated list)
//post (add items to playlist) /playlists/{playlist_id}/tracks
    //(comma separated)
//post (create playlist) /users/{user_id}/playlists