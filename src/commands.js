/** SLASH COMMANDS: ===================================================================================================
*/
require('dotenv').config();
const {WebClient} = require('@slack/client');

const {newAgendaNotify} = require('./notifications');
const {botOpts} = require('./options');
const {getBotUsersPromise, getTargetChannelIdPromise} = require('./utils');
const {
    initDiscussionMessage, closeDiscussionMessage, initDiscussionDialog, composeAgenda, closeDiscussion
} = require('./discussion');
const {
    initTopicMessage, voteTopicMessage, initTopicDialog, showTopics
} = require('./topic');


const web = new WebClient(process.env.WEB_API_TOKEN);


module.exports = {
    // Discussion initialization:
    lcInit: ['/discussion/init', function(req, res) {
        console.log('command:lc-init');
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
        if (req.body.channel_name !== botOpts.targetChannel.name) {
            res.status(200).send(`This command is available from '${botOpts.targetChannel.name}' channel only.`);
            return
        }
        res.status(200).send(initDiscussionMessage);
        web.dialog.open(initDiscussionDialog, triggerId);
    }],

    // Discussion activation (manual deadline):
    lcFreeze: ['/discussion/activate', function(req, res) {
        console.log('command:lc-freeze');
        res.status(200).send({text: 'Freezing Discussion...'});
        // getBotUsersPromise().then((res) => console.log(res));
        // getTargetChannelIdPromise('botex').then((res) => console.log(res));
        composeAgenda(newAgendaNotify, req.body.channel_id, req.body.user_id);
    }],

     // Discussion archivation:
    lcClose: ['/discussion/close', function(req, res) {
        console.log('command:lc-close');
        // const triggerId = req.body.trigger_id;
        res.status(200).send(closeDiscussionMessage);
        console.log('Pretending this is happening...')
        // closeDiscussion();
        //TODO: ^^
        // web.dialog.open(initDiscussionDialog, triggerId);
    }],

    // Topic initialization:
    lcTopic: ['/topic/init', function(req, res) {
        const triggerId = req.body.trigger_id;
        res.status(200).send(initTopicMessage);
        web.dialog.open(initTopicDialog, triggerId);
    }],

    // Perform Voting:
    lcVote: ['/topic/vote', function(req, res) {
        console.log('command:lc-vote');
        res.status(200).send(voteTopicMessage);
        showTopics(req.body.channel_id, req.body.user_id)
    }]
};
