// Import express and request modules
var express = require('express');
var request = require('request');

require('dotenv').config();


// var slackAppToken = process.env.SLACK_APP_TOKEN;
// var slackBotToken = process.env.SLACK_BOT_TOKEN;
var clientId = process.env.APP_CLIENT_ID;
var clientSecret = process.env.APP_CLIENT_SECRET;

// Instantiates Express and assigns our app variable to it
var app = express();

// Again, we define a port we want to listen to
const PORT=8822;

// Lets start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port " + PORT);
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

// Incoming POST route the endpoint that our slash command will point to
// and send back a simple response as feedback
app.post('/discussion/init', function(req, res) {
    console.log(req, res)
    // res.send({
    //     "text": "I'm alive!",
    //     "attachments": [
    //         {
    //             "text": "Partly cloudy today and tomorrow"
    //         }
    //     ]
    // });
    res.sendStatus(200);
    setTimeout(delayed, 2000, 'I remember U!');
    function delayed(message) {
        console.log('sending delayed...', req.response_url, res.response_url);
        request
            .post(req.response_url, {
                headers: {'content-type': 'application/json'},
                body: {"text": message}
            })
            .on('response', function(response) {
                response.json(body);
            })
            .on('error', function(error) {
                console.log(error);
            });
    }
});
