// check for authorization with access token 
// if access token is not valid get a new one and return new one
const { login, refreshToken } = require('../helpers/authorization');
const fetch = require('node-fetch');
const app = {
    TINGG_URL: 'https://api.stage01a.tingg.io/v1',
    email: 'e.thieme@reedu.de',
    pw: 'senseboxRocks'
};
module.exports.isAuthorized = async function (access_token) {
    console.log("authorizing");
    let token;
    // make get to here https://api.stage01a.tingg.io/v1/modems
    // if successful return token 
    // if not refresh token with old one
    let response = await fetch(app.TINGG_URL + '/v1/modems', {
        method: 'GET',
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
    })
    if (response.ok) {
        token = access_token
    }
    else {
        // do login / refresh the token
        console.log("not valid trying to refresh the token");
        if (!access_token) {
            token = await login({ "email": app.email, "password": app.pw });
        }
        else {
            refreshResponse = await refreshToken(access_token);
            if (refreshResponse.ok) {
                refreshResponse = await refreshResponse.json();
                token = refreshResponse.token;
            }
            else {
                token = await login({ "email": app.email, "password": app.password });
            }
        }

    }
    return token;
}