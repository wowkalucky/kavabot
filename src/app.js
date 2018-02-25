const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const { slackMessages } = require('./actions');
require('dotenv').config();

const {lcInit, lcTopic, lcVote} = require('./commands');


const clientId = process.env.APP_CLIENT_ID;
const clientSecret = process.env.APP_CLIENT_SECRET;

// Express web server initialization:
const PORT=8822;
const app = express();
// middleware parsers:
app.use(bodyParser.json());                        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));  // to support URL-encoded bodies

// Server's launch:
app.listen(PORT, function () {
    console.log("Listening on port " + PORT);
});

// interactive commands endpoint:
app.use('/intercom', slackMessages.expressMiddleware());

app.post('/events', (req, res) => {
    console.log('EVENTS: ', req.body);
    res.send(req.body.challenge);
    // res.sendStatus(200);
    // TODO: bot commands:
    // - topic,
    // - vote
});

// This route handles GET requests to our root ngrok address and responds with the same
// "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

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
        // If it's there...
        // "{\"ok\":true,\"access_token\":\"xoxp-223289645846-222325276259-310245498978-9910c5676c8ae09bc38f52a18a847ed4\",\"scope\":\"identify,bot,commands\",\"user_id\":\"U6J9K847M\",\"team_name\":\"Slatyne Online\",\"team_id\":\"T6K8HJZQW\",\"bot\":{\"bot_user_id\":\"U94AQHUFP\",\"bot_access_token\":\"xoxb-310364606533-qIOvddqjoxi5bVvYKFYKP2RY\"}}"

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

// Actions URLS:
app.post(...lcInit);
app.post(...lcTopic);
app.post(...lcVote);
