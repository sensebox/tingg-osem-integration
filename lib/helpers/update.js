const fetch = require('node-fetch');
const app = {
    TINGG_URL: 'https://api.tingg.io'
};
/**
 * Updates thing types at tingg
 * uses sensors array from changed box to build new thing-types
 * 
 * 
 * !!! needs to get paramters thing_type_id through GET https://api.stage01a.tingg.io/v1/modems/:imsi first !!!
 * @param {262075600145008} imsi 
 */
const updateThingType = async function updateThingType(thingTypeID, resources, access_token) {
    let response = await fetch(app.TINGG_URL + '/thing-types/' + thingTypeID, {
        method: 'PATCH',
        body: JSON.stringify(resources),
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
    })
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401')
        }
        throw new Error(response.statusText, { status: response.status })
    }
    response = await response.json();
    return response;
}

const thingByIMSI = async function modemByIMSI(imsi, access_token) {
    let response = await fetch(app.TINGG_URL + '/modems/' + imsi, {
        method: 'GET',
        headers: { "Authorization": "Bearer " + access_token}
    });
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401')
        }
        throw new Error(response.statusText, { status: response.status })
    }
    response = await response.json();
    return response.thing_id;
}

const thingTypeByThingId = async function thingTypeByThing(thing_id, access_token) {
    let response = await fetch(app.TINGG_URL+'/things/'+thing_id, {
        method:'GET',
        headers: { "Authorization": "Bearer " + access_token}
    });
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401')
        }
        throw new Error(response.statusText, { status: response.status })
    }
    response = await response.json();
    return response.thing_type_id;
}


/**Helper function to build the data accordingly from the sensor array
 *  needs name and box id
 * @param {data} box  
 */
const buildBody = function buildBody(data) {
    let resources = []
    if (data.sensors) {
        data.sensors.map((sensor) => {
            let toAdd = {
                "topic": `/osm/${data._id}/${sensor._id}`,
                "method": "pub",
                "type": "object"
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
    updateThingType,
    thingByIMSI,
    thingTypeByThingId,
    buildBody
}

