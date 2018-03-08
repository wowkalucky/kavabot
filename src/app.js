/** MAIN APP MODULE
*/

const express = require('express');
const request = require('request');
const helmet = require('helmet');

const bodyParser = require('body-parser');
const { slackMessages } = require('./actions');
require('dotenv').config();

const {lcInit, lcFreeze, lcClose, lcTopic, lcVote} = require('./commands');


const clientId = process.env.APP_CLIENT_ID;
const clientSecret = process.env.APP_CLIENT_SECRET;

// Express web server initialization:
const PORT= process.env.PORT || 8822;
const app = express();


// Middlewares:
app.use(helmet());
// parsers:
app.use(bodyParser.json());                        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));  // to support URL-encoded bodies

// Server's launch:
app.listen(PORT, function () {
    console.log("Listening on port " + PORT);
});

// interactive commands endpoint:
app.use('/intercom', slackMessages.expressMiddleware());

// Ngrok test route:
app.get('/', function(req, res) {
    res.send('KAVABOT is online!\nPath Hit: ' + req.url);
});

// Actions URLS:
app.post(...lcInit);
app.post(...lcFreeze);
app.post(...lcClose);
app.post(...lcTopic);
app.post(...lcVote);

// Events URI: TBD
app.post('/events', (req, res) => {
    console.log('EVENTS: ', req.body);
    res.send(req.body.challenge);
    // res.sendStatus(200);
    // TODO: bot commands:
    // - topic,
    // - vote
});


// Wide distribution part (not for now...)

// This route handles get request to a /oauth endpoint.
// We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint.
    // If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret,
        // and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET',  //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        })
    }
});
