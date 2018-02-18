/** SLASH COMMANDS: ===================================================================================================
*/
const { WebClient } = require('@slack/client');
require('dotenv').config();

const {initDiscussionMessage, initDiscussionDialog, showAgenda} = require('./discussion');
const {initTopicMessage, voteTopicMessage, voteMessage, initTopicDialog} = require('./topic');


const web = new WebClient(process.env.WEB_API_TOKEN);

module.exports = {
    // Discussion initialization:
    lcInit: ['/discussion/init', function(req, res) {
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
    }],
    // Topic initialization:
    lcTopic: ['/topic/init', function(req, res) {
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
        res.status(200).send(initTopicMessage);
        web.dialog.open(initTopicDialog, triggerId);payload
    }],
    // Perform Voting:
    lcVote: ['/topic/vote', function(req, res) {
        // console.log(req.body);
        // BODY:

        const triggerId = req.body.trigger_id;
        res.status(200).send(voteTopicMessage);

        showAgenda(req.body.channel_id, req.body.user_id, voteMessage);
        // web.dialog.open(initTopicDialog, triggerId);
    }]
};
