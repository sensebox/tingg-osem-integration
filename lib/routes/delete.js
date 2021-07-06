'use strict';


/**
 * Router for updating thing-types from OSM
 * @module routes/update
 * @license MIT
 */

const router = require('express').Router(),
    { Box } = require('@sensebox/opensensemap-api-models'),
    { createLogger } = require('../logging'),
    { isAuthorized } = require('../modules/auth'),
    {  deactivateModem, deleteThingType, deleteThing } = require('../helpers/delete'),
    { thingByIMSI, thingTypeByThingId } = require('../helpers/update');
    
const deleteModem = async function deleteModem(req, res, next){
    const incomingbox = req.body;
    let access_token = await isAuthorized();
    try{
        let imsi =  incomingbox.imsi;
        const thingId = await thingByIMSI(imsi, access_token);
        const thingTypeId = await thingTypeByThingId(thingId,access_token);
        const unlink = await deactivateModem(imsi, access_token);
        const thing = await deleteThing(thingId, access_token);
        const thingType = await deleteThingType(thingTypeId, access_token);
        res.status(201).send("Deletion successful");
    }
    catch(err){
        res.locals = err;
        return next();
    } 
}



module.exports = router; 
router.post('/', [deleteModem]);
