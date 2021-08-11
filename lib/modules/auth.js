// check for authorization with access token 
// if access token is not valid get a new one and return new one
const { login, refreshToken } = require('../helpers/authorization');
const fetch = require('node-fetch');
const config = require('config');
const app = {
    TINGG_URL: 'https://api.tingg.io',

};
let token;
module.exports.isAuthorized = async function () {
    // make get to here https://api.stage01a.tingg.io/v1/modems
    // if successful return token 
    // if not refresh token with old one
    let response = await fetch(app.TINGG_URL + '/modems', {
        method: 'GET',
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
    })
    if (response.ok) {
        return token; 
    }
    else {
        // do login / refresh the token
        if (!token) {
            console.log(process.env.TINGG_USER,process.env.TINGG_PW)
            access_token = await login({ "email": process.env.TINGG_USER, "password": process.env.TINGG_PW})
        }
        else {
            refreshResponse = await refreshToken(token);
            if (refreshResponse.ok) {
                refreshResponse = await refreshResponse.json();
                token = refreshResponse.token;
            }
            else {
                access_token = await login({ "email": process.env.TINGG_USER, "password": process.env.TINGG_PW})
            }
        }

    }
    return token;
}