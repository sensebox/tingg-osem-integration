'use strict';

/**
 * Router for updating thing-types from OSM
 * @module routes/update
 * @license MIT
 */

const router = require('express').Router(),
    { isAuthorized } = require('../modules/auth'),
    { updateThingType, thingByIMSI, thingTypeByThingId, buildBody } = require('../helpers/update');


// removing & adding thing-types

// only care about changes in sensor setup
const updateBox = async function updateBox(req, res, next){
    // get modem by imsi 
    // get linked thing 
    // get thing type id by linked thing
    
    const incomingbox = req.body
    let access_token = await isAuthorized();
    try{
        let imsi = incomingbox.integrations.gsm.imsi;
        const thingId = await thingByIMSI(imsi, access_token);
        const thingTypeId = await thingTypeByThingId(thingId,access_token);
        const thingtypebody = buildBody(incomingbox);
        let updatedThingType= await updateThingType(thingTypeId, thingtypebody,access_token);
        res.status(201).send({message:"Thing Type updated",new:updatedThingType});
    }
    catch(err){
        res.locals = err;
        return next();
    }
}

const deleteBox = async function deleteBox(req, res, next){

}
module.exports = router;
router.post('/',[updateBox, deleteBox])




