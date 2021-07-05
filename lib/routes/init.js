// receives newBox element and creates thing, thing-type 
// after creating Box is updated with updateBox on DB
'use strict';

/**
 * Router for initiation of tingg API 
 * @module routes/init
 * @license MIT 
 */
const router = require('express').Router(),
    { isAuthorized } = require('../modules/auth'),
    { createThing, createThingType, linkModem } = require('../helpers/init');
/**
 * Accepts a POST request from OSM UI and creates a thing,thing-type at tingg
 * afterwards updates box in db 
 * @name 'POST /init'
 * @example
 * curl -X POST -H "content-type: application/json" -d \
 *   '{ newBox }' \
 *   localhost:3000/v1.1
 */

const initTingg = async function initTingg(req, res, next) {
    const incomingbox = req.body;
    let thing_id, thing_type_id, link_id;
    // check if access token for tingg is valid, if not get new one
    let access_token = await isAuthorized();
    try {
        thing_type_id = await createThingType(incomingbox,access_token);
        thing_id = await createThing(incomingbox.name, thing_type_id,access_token);
        link_id = await linkModem(incomingbox.integrations.gsm.imsi, thing_id,access_token);
        res.status(201).send('Box creation successful');
    } catch (err) {
        console.log(err);
        res.locals = err;
        return next();
    }
}

router.post('/', [initTingg]);

module.exports = router; 