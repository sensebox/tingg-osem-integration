const fetch = require('node-fetch');
const app = {
    TINGG_URL: 'https://api.tingg.io/v1'
};
/**
 * Deactivates modem for the user account the token is specified with
 * Gets imsi as request parameter
 * @param {5378459734895} imsi 
 */
 const deactivateModem = async function deactivateModem(imsi, access_token) {
    let response = await fetch(app.TINGG_URL + '/modems/' + imsi + '/link', {
        method: 'DELETE',
        headers: { "Authorization": "Bearer " + access_token }
    })
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401')
        }
        throw new Error(response.statusText, { status: response.status })
    }
    return response;
}

const deleteThingType = async function deleteThingType(thing_type_id, access_token){
    let response = await fetch(app.TINGG_URL + '/thing-types/'+thing_type_id, {
        method:'DELETE',
        headers: { "Authorization": "Bearer " + access_token }
    })
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401')
        }
        throw new Error(response.statusText, { status: response.status })
    }
    return response;


}

const deleteThing = async function deleteThing(thing_id, access_token){
    let response = await fetch(app.TINGG_URL + '/things/'+thing_id, {
        method:'DELETE',
        headers: { "Authorization": "Bearer " + access_token }
    })
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401')
        }
        throw new Error(response.statusText, { status: response.status })
    }
    return response;


}


module.exports = {
    deactivateModem,
    deleteThing,
    deleteThingType
}