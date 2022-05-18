import * as https from 'https';
import fetch from 'node-fetch';
import { URL } from 'url';
import express from 'express';
import ace from 'atlassian-connect-express';
import { dynamicMacro } from './dynamic';
import { macroPlaceholder } from './placeholder';

// Configure Express app and ACE middleware for dynamic macro
// FIXME respect port
const port = process.env.PORT || 3001;
const app = express();
// https://developer.atlassian.com/server/hipchat/getting-started-with-atlassian-connect-express/
const aceMiddleware = ace(app);
app.use(aceMiddleware.middleware());

app.get('/dynamic-macro', aceMiddleware.authenticate(), 
    // Pass addon global var to handler function
    (req, res)=> dynamicMacro(req, res, aceMiddleware.httpClient(req)));

app.get('/placeholder', aceMiddleware.authenticate(), 
    // Pass addon global var to handler function
    (req, res)=> macroPlaceholder(req, res, aceMiddleware));
