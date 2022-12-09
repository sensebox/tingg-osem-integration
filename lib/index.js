'use strict';

const express = require('express'),
  cors = require('cors'),
  server = express(),
  {
    db: { connect, mongoose },
  } = require('@sensebox/opensensemap-api-models'),
  config = require('config'),
  { createLogger } = require('./logging'),
  measurementRouter = require('./routes/measurement'),
  verifyRouter = require('./routes/verify'),
  initRouter = require('./routes/init'),
  updateRouter = require('./routes/update'),
  deleteRouter = require('./routes/delete');
const log = createLogger('server');


server.use(function reqLogger (req, res, next) {
  req.time = new Date();
  log.debug({ req }, `${req.method} ${req.url} from ${req.ip}`);
  next();
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors({origin:'*'}));
// major version: TTN HTTP API version
// minor version: version of this API
server.use('/measurement', measurementRouter);
server.use('/init', initRouter);
server.use('/verify', verifyRouter);
server.use('/update', updateRouter);
server.use('/delete', deleteRouter);


server.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send('Something broke!');
});

server.use(function notFoundHandler (req, res, next) {
  if (!res) {
    res.status(404).type('txt')
      .send("Path not found");
  }
  next();
});

// launch server once connected to DB
mongoose.set('debug', false);
connect().then(function onDBConnection () {
  server.listen(config.port, (err) => {
    if (!err) {
      log.info(`server listening on port ${config.port}`);
    } else {
      log.error(err);
    }
  });
});

