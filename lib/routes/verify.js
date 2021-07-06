/**
 * Verifies Modem before registering thing and thing types
 * @param {"imsi":5384658345,"secret_code":"LHIUYSjhj"} data 
 */
const router = require('express').Router();
const { isAuthorized } = require('../modules/auth');
const {verifyModem, checkModemInUse} = require('../helpers/verify');

const verify = async function verify(req, res, next) {
    const { imsi, secret_code } = req.body;
    const access_token = await isAuthorized();
    try {
        const verify = await verifyModem(imsi, secret_code, access_token);
        if(!verify) res.status(404).send("IMSI & Secret code could not be verified");
        else {
            const inUse = await checkModemInUse(imsi,access_token);
            if(!inUse) res.status(412).send("Modem already in use, please deactivate before registering a new senseBox to this IMSI"); 
            else res.status(201).send("IMSI & Secret code are valid and can be used!");
        }
    } catch (err) {
        res.locals = err;
        return next();
    }
}




router.post('/', [verify]);

module.exports = router;