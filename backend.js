
var CLIENT_ID = '18ec3a8ae37b4abf8db2acf039535733';
var CLIENT_SECRET = '566aee40e83a4ef1924c8d411816aa51';
var REDIRECT_URI = 'http://localhost:8888/callback/';

//depreciated, change to URLSearchParams
const querystring = require('querystring');


const express = require('express');
const app = express();
const axios = require('axios');
const port = 8888;

app.get('/', (req, res) => {
    const data = {
        name: 'Hello',
        isAwesome: true
    }

    res.json(data);
});

//
const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const stateKey = 'spotify_auth_state';

app.get('/login', (req, res) => {
    const scope = 'user-read-private playlist-read-collaborative playlist-read-private user-library-read user-library-modify playlist-modify-public';
    const state = generateRandomString(16);
    res.cookie(stateKey, state);


    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: scope
    });

    //res.send('Log in to Spotify');
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
    // your application requests authorization
 
})

app.get('/callback', (req, res) => {
    //in the callback link, response code is included as a query parameter, access with req.query.code
    const code = req.query.code || null;

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
    })

    .then(response => {
        if (response.status === 200) {
            const { access_token , refresh_token, expires_in } = response.data;

            //pass access and refresh tokens as queryParams
            const queryParams = querystring.stringify({
                access_token,
                refresh_token,
                expires_in,
            })

            //if spotify responds with 200 code (success), redirect to react app
            res.redirect(`http://localhost:3000/?${queryParams}`)
            
        } else {
            res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`);
        }
    })
    .catch(error => {
        res.send(error);
    })


})

app.get('/refresh_token', (req, res) => {
    const { refresh_token } = req.query;

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        }
    })
    .then(response => {
        res.send(response.data);
    })
    .catch(error => {
        res.send(error);
    });
});

app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});



