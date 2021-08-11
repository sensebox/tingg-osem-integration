/**
 * logs into tingg developer account
 * @param {"email":"email","password":"password"} data 
 */
const fetch = require('node-fetch');
const app = {
    TINGG_URL: 'https://api.tingg.io'
};
const login = async function login(data) {
    let response = await fetch(app.TINGG_URL + '/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    response = await response.json();
    return response.token;

}
/**
 * gets new token based on old one
 * @param token: String
 */
const refreshToken = async function refreshToken(access_token) {
    let response = await fetch(app.TINGG_URL + '/auth/token-refresh', {
        method: 'POST',
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
    })
    return response;
}

module.exports = {
    login,
    refreshToken
}