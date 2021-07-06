const fetch = require('node-fetch');
const config = require('config');
const app = {
    TINGG_URL: 'https://api.stage01a.tingg.io/v1'
};

const checkModemInUse = async function checkModemInUse(imsi, access_token) {
    let response = await fetch(app.TINGG_URL + '/modems/' + imsi, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    if (!response.ok) {
        return false;
    }
    response = await response.json();
    if(response.thing_id) return false;
    return true;
}

/**
 * Verifies Modem before registering thing and thing types
 * @param {"imsi":5384658345,"secret_code":"LHIUYSjhj"} data 
 */
const verifyModem = async function verifyModem(imsi, secret_code, access_token) {
    let response = await fetch(app.TINGG_URL + '/modems/' + imsi + '/own?code=' + secret_code, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    if (!response.ok) {
        return false;
        throw new Error(response.status);
    }
    return true;
}

module.exports = {
    verifyModem,
    checkModemInUse
}
