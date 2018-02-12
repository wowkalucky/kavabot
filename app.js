const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/client');

const {initDiscussion} = require('./discussion');


require('dotenv').config();


const clientId = process.env.APP_CLIENT_ID;
const clientSecret = process.env.APP_CLIENT_SECRET;
const slackMessages = createMessageAdapter(process.env.VERIFICATION_TOKEN);
const web = new WebClient(process.env.WEB_API_TOKEN);

// Instantiates Express
const PORT=8822;
const app = express();
app.use(bodyParser.json());                        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));  // to support URL-encoded bodies
app.use('/slack/actions', slackMessages.expressMiddleware());

// Lets start our server
app.listen(PORT, function () {
    console.log("Example app listening on port " + PORT);
});

app.post('/events', (req, res) => {
    console.log('EVENTS: ', req.body);
    res.send(req.body.challenge);
    // res.sendStatus(200);
});

const URLS = {
    lcInit: '/discussion/init',
};

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

// Discussion initialization:
app.post(URLS.lcInit, function(req, res) {
  //  { token: '8wIvXEnO3Dp0VB1yd2kljBOP',
  // team_id: 'T6K8HJZQW',
  // team_domain: 'slatyne',
  // channel_id: 'C94H16BPX',
  // channel_name: 'botex',
  // user_id: 'U6J9K847M',
  // user_name: 'wowkalucky',
  // command: '/lc-init',
  // text: '',
  // response_url: 'https://hooks.slack.com/commands/T6K8HJZQW/313262914194/TCHYINQKmxwHMTUuJ2czz92g',
  // trigger_id: '313262914242.223289645846.a53afbfc5f63ea370b7c437127cbf8a1' }  //who, what, where, and when.
    const responseUrl = req.body.response_url;
    const triggerId = req.body.trigger_id;

    // res.sendStatus(200);
    console.log('New Discussion initialization...');
    const dialog = JSON.stringify({
        "callback_id": "init_discussion",
        "title": "New LeanCofee discussion",
        "submit_label": "Initiate",
        "elements": [
            {
                "type": "text",
                "label": "Pick the day",
                "name": "discussion_day",
                "hint": "When will it happen?",
                "value": "This Friday!",
            },
            {
                "type": "select",
                "label": "Time",
                "name": "discussion_time",
                "hint": "What time is suitable?",
                "value": "13:00",
                "options": [
                    {
                        "label": "12:00",
                        "value": "12:00"
                    },
                    {
                        "label": "13:00",
                        "value": "13:00"
                    },
                    {
                        "label": "14:00",
                        "value": "14:00"
                    },
                ]
            },
            {
                "type": "text",
                "label": "Want to change location?",
                "name": "discussion_place",
                "optional": "true",
                "hint": "We can do it everywhere!",
                "value": "Basement Hall",
            }
        ]
    });
    web.dialog
        .open(dialog, triggerId)
        .then((res) => {
            console.log('dialog.response', res.body);
            initDiscussion();
        });
});
