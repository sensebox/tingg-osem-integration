'use strict';

/**
 * Router for tingg integratoin API v1
 * @module routes/v1.0
 * @license MIT
 */

const router = require('express').Router(),
    { Box, Measurement } = require('@sensebox/opensensemap-api-models'),
    { decodeTinggMessage } = require('../decoding/tingg'),
    { createLogger } = require('../logging');


/**
* express middleware, sending responses & compute reponse time
*
* expects res.local to contain { code, data } or an Error
* expects req.time to be a Date
* @private
*/
const sendResponse = function sendResponse(req, res, next) {
    let data = res.locals;

    // handle undhandled errors
    if (!data.code) {
        data = { code: 501, msg: data };
    }

    data.msg = data.msg.toString();

    res.status(data.code).json(data);
    res.locals.responseTime = Date.now() - req.time.getTime();

    next();
};

const log = createLogger('webhook-v1.0', {
    serializers: {
        box(box) {
            return box
                ? { id: box._id, sensors: box.sensors, ttn: box.integrations.ttn }
                : {};
        },
        res(res) {
            const { msg, responseTime, code } = res.locals;

            return { msg, responseTime, code };
        },
    },
});

/**
 * express middleware, logging result of a webhook request
 * @private
 */
const logResponse = function logResponse(req, res, next) {
    const { msg, responseTime, code } = res.locals;
    const message = `${code} (${responseTime}ms): ${msg}`;
    if (code >= 500) {
        log.error({ res }, message);
    } else if (code >= 400) {
        log.warn({ res, box: req.box, payload: req.body }, message);
    } else {
        log.info({ res }, message);
    }
    next();
};

/**
 * Accepts a POST request from the tingg API and decodes it's payload to store a set of measurements for a box.
 * The box is identified by it's topic.
 * @name 'POST /v1.1'
 * @example
 * curl -X POST -H "content-type: application/json" -d \
 *   '{ "topic": "osm/604a2c79f7b313001b52b56f/604a2c79f7b313001b52b571", "payload": "{"value":22}" }' \
 *   localhost:3000/v1.1
 */
const httpIntegrationHandler = async function httpIntegrationHandler(req, res, next) {
    const { topic, payload } = req.body;
    const { boxid, sensorid, value, createdat, lat, lng } = decodeTinggMessage(topic, payload);
    const location = [lat, lng]
    log.debug(boxid);
    log.debug({ payload: req.body }, 'payload');

    if (
        !topic ||
        !payload
    ) {
        Object.assign(res.locals, {
            code: 422,
            msg: 'malformed request: any of [topic,payload] is missing'
        });

        return next();
    }
    // Populate lastMeasurement on box
    const BOX_SUB_PROPS_FOR_POPULATION = [
        {
            path: 'sensors.lastMeasurement', select: { value: 1, createdAt: 1, _id: 0 }
        },
    ];
    try {
        const box = await Box.findBoxById(boxid, { populate: false, lean: false });
        const [measurement] = await Measurement.decodeMeasurements([{
            sensor_id:sensorid,
            value,
            createdAt: createdat,
            location
        }]);
        console.log(measurement)
        await box.saveMeasurement(measurement);
        res.status(201).send("Measurement saved in box");
    } catch (err) {
        res.locals = err;
        return next();
    }
};


router.post('/', [httpIntegrationHandler, sendResponse, logResponse]);


module.exports = router;
