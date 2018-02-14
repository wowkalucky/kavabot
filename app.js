const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const { slackMessages } = require('./actions');
require('dotenv').config();

const {initDiscussionMessage, initDiscussionDialog} = require('./discussion');
const {initTopicMessage, initTopicDialog} = require('./topic');


db = {};

const clientId = process.env.APP_CLIENT_ID;
const clientSecret = process.env.APP_CLIENT_SECRET;
// const slackMessages = createMessageAdapter(process.env.VERIFICATION_TOKEN);
const web = new WebClient(process.env.WEB_API_TOKEN);

// Express web server initialization:
const PORT=8822;
const app = express();
// middleware parsers:
app.use(bodyParser.json());                        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));  // to support URL-encoded bodies

// Server's launch:
app.listen(PORT, function () {
    console.log("Example app listening on port " + PORT);
});

// ENDPOINTS:
const URLS = {
    lcInit: '/discussion/init',
    lcTopic: '/topic/init',
};

// interactive commands endpoint:
app.use('/intercom', slackMessages.expressMiddleware());

app.post('/events', (req, res) => {
    console.log('EVENTS: ', req.body);
    res.send(req.body.challenge);
    // res.sendStatus(200);
});

// This route handles GET requests to our root ngrok address and responds with the same
// "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
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

// SLASH COMMANDS: ===================================================================================================

// Discussion initialization:
app.post(URLS.lcInit, function(req, res) {
    // console.log(req.body);
    // BODY:
    // {
    //   token: '8wIvXEnO3Dp0VB1yd2kljBOP',
    //   team_id: 'T6K8HJZQW',
    //   team_domain: 'slatyne',
    //   channel_id: 'C94H16BPX',
    //   channel_name: 'botex',
    //   user_id: 'U6J9K847M',
    //   user_name: 'wowkalucky',
    //   command: '/lc-init',
    //   text: '',
    //   response_url: 'https://hooks.slack.com/commands/T6K8HJZQW/313486814977/6uHO5oycxjkA3bcjIqS2xt4g',
    //   trigger_id: '315091880999.223289645846.0f1bc7d6b4ff7ab92897ed3f6914428b'
    // }

    const triggerId = req.body.trigger_id;
    res.status(200).send(initDiscussionMessage);
    web.dialog.open(initDiscussionDialog, triggerId);
});

// Topic initialization:
app.post(URLS.lcTopic, function(req, res) {
    // console.log(req.body);
    const triggerId = req.body.trigger_id;

    res.status(200).send(initTopicMessage);
    web.dialog.open(initTopicDialog, triggerId);
});


exports = {
    db,
    slackMessages,
};
