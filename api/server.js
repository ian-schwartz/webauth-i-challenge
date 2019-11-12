const express = require('express');
const session = require('express-session');
const KnexSessionStorage = require('connect-session-knex')(session);

const apiRouter = require('./api-router.js');
const configMiddleware = require('./config-middleware');
const knexConnection = require('../database/db-config');

const server = express();

const sessionConfig = {
    name: 'tiger', // default name is sid
    secret: process.env.COOKIE_SECRET || 'is it secret? is it safe?',
    cookie: {
      maxAge: 1000 * 6 * 60, // valid for 1 hour (in milliseconds)
      secure: process.env.NODE_ENV === 'development' ? false : true, // do we send cookie over https only
      httpOnly: true, // prevent client javascript code from accessing the cookie
    },
    resave: false, // save sessions even when they have not changed
    saveUninitialized: true, // read about it on the docs to respect GDPR
    store: new KnexSessionStorage({
      knex: knexConnection,
      clearInterval: 1000 * 60 * 10, // delete expired sessions every 10 mins
      tablename: 'user_sessions',
      sidfieldname: 'id',
      createtable: true
    })
  };

configMiddleware(server);

server.use(session(sessionConfig));

server.use('/api', apiRouter);

server.get('/', (req, res) => {
    res.json({ api: 'up', session: req.session });
  });

module.exports = server;
