const fetch = require('node-fetch');
const config = require('config');
const app = {
    TINGG_URL: 'https://api.tingg.io',
};
/*
    calls POST https://api.tingg.io/v1/thing-types to create thing types 
    should be called right after verifyModem()
    input: data:{box}
    output: thing_type_id
*/
const createThingType = async function createThingType(box,access_token) {
    const thingtypebody = buildBody(box);
    let response = await fetch(app.TINGG_URL + '/thing-types', {
        method: 'POST',
        body: JSON.stringify(thingtypebody),
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }

    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    response = await response.json();
    let thing_type_id = response.id;
    return thing_type_id;
}

/*
    calls POST https://api.tingg.io/v1/things to create a thing
    input: thing_type_id from previous request
    output: thing_id

    data = {
    "name": "Some name, maybe senseBoxId",
    "thing_type_id": "80fe09c5-bd02-43b7-9947-ea6ad458181b"
    }

*/

const createThing = async function createThing(boxname, thingid,access_token) {
    const body = { "name": boxname, "thing_type_id": thingid }
    let response = await fetch(app.TINGG_URL + '/things', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
    })
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    response = await response.json();
    response = response.id;
    return response;

}

/*
    calls POST https://api.tingg.io/v1/modems/:imsi/link to verify modem and thing id 
    input: imsi and thing_id 
    output:200/400 status code 
*/
const linkModem = async function linkModem(imsi, thing_id,access_token) {
    let response = await fetch(app.TINGG_URL + '/modems/' + imsi + '/link', {
        method: 'POST',
        body: JSON.stringify({ thing_id }),
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
    })
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    response = await response.json();
    return response;


}
/**
 * Updates thing types at tingg
 * uses sensors array from changed box to build new thing-types
 * @param {box} box 
 */
const updateThingType = async function updateThingType(box) {
    const thingtypebody = buildBody(box)
    let response = await fetch(app.TINGG_URL + '/thing-types/' + box.integrations.gsm.thing_type_id, {
        method: 'PATCH',
        body: JSON.stringify(thingtypebody),
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
    })
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    response = await response.json();
    return response;
}


/**
 * Deactivates modem for the user account the token is specified with
 * Gets imsi as request parameter
 * @param {5378459734895} imsi 
 */
const deactivateModem = async function deactivateModem(imsi) {
    let response = await fetch(app.TINGG_URL + '/modems/' + imsi + '/link', {
        method: 'DELETE',
        headers: { "Authorization": "Bearer " + access_token }
    })
    if (!response.ok) {
        throw new Error(response.status);
    }
    response = await response.json();
    return response

}
/**
 * Verifies Modem before registering thing and thing types
 * @param {"imsi":5384658345,"secret_code":"LHIUYSjhj"} data 
 */
const verifyModem = async function verifyModem(data) {
    let response = await fetch(app.TINGG_URL + '/modems/' + data.imsi + '/own?code=' + data.secret_code, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    if (!response.ok) {
        throw new Error(response.status);
    }
    return response;
}
const checkModemInUse = async function checkModemInUse(data) {
    let response = await fetch(app.TINGG_URL + '/modems/' + data.imsi, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    if (!response.ok) {
        throw new Error(response.status);
    }
    response = await response.json();
    if (response.thing_id) {
        throw new TinggError(`Tingg Error: Modem already in use, please deactivate before registering a new senseBox to this IMSI`, { status: 412 });
    }
    return false


}
/**
 * Error handler when Authentifcation at tingg failed
 */
const handleAuthError = async function handleAuthError() {
    console.log(app.email,app.pw);
    console.log("#################");
    console.log(config.get('TINGG_USER'), config.get('TINGG_PW'));
    if (!access_token) {
        // access_token = await login({ "email": config.get('integrations.gsm.email'), "password": config.get('integrations.gsm.password') })
        access_token = await login({ "email": config.get('TINGG_USER'), "password": config.get('TINGG_PW')})
    }
    else {
        try {
            access_token = await refreshToken();
        } catch (e) {
            access_token = await login({ "email": config.get('TINGG_USER'), "password": config.get('TINGG_PW')})
        }
    }
}

const buildBody = function buildBody(data) {
    let resources = []
    if (data.sensors) {
        data.sensors.map((sensor) => {
            let toAdd = {
                "topic": `/osm/${data._id}/${sensor._id}`,
                "method": "pub",
                "type": "string"
            }
            resources.push(toAdd);
        })
    }
    let body = {
        "name": data._id,
        "description": "Some basic description",
        "resources": resources
    }
    return body;
}

module.exports = {
    createThingType,
    createThing,
    linkModem,
    updateThingType,
    deactivateModem,
    verifyModem,
    checkModemInUse,
}