const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/client');
require('dotenv').config();

const db = require('./storage');
const {general, statuses} = require('./options');
const {initDiscussion, formatSuccessDiscussionMessage, showAgenda} = require('./discussion');
const {initTopic, formatSuccessTopicMessage, showTopics} = require('./topic');


const web = new WebClient(process.env.WEB_API_TOKEN);
const slackMessages = createMessageAdapter(process.env.VERIFICATION_TOKEN);

slackMessages.action('init_discussion', (payload) => {
    // console.log('payload', payload);
    // PAYLOAD:
    // {
    //     type: 'dialog_submission',
    //     submission: {
    //         discussion_day: '2018-02-02 | This Friday!', ?
    //         discussion_time: '12:00',
    //         discussion_place: 'Basement Hall'
    //     },
    //     callback_id: 'init_discussion',
    //     team: { id: 'T6K8HJZQW', domain: 'slatyne' },
    //     user: { id: 'U6J9K847M', name: 'wowkalucky' },
    //     channel: { id: 'C94H16BPX', name: 'botex' },
    //     action_ts: '1518475563.667618',
    //     token: '8wIvXEnO3Dp0VB1yd2kljBOP'
    // }

    initDiscussion(payload.submission);

    // send success message:
    const message = formatSuccessDiscussionMessage(
        payload.submission.discussion_day,
        payload.submission.discussion_time,
        payload.submission.discussion_place
    );
    showAgenda(payload.channel.id, payload.user.id, message);

    return {}
});

slackMessages.action('init_topic', (payload) => {
    console.log('[action:init_topic]');

    initTopic({
        ...payload.submission,
        ts: payload.action_ts,
        author: payload.user
    });

    // send success message:
    web.chat.postMessage(
        payload.channel.id,
        formatSuccessTopicMessage(payload.user.name),
        {attachments: [{
            "callback_id": "show_backlog",
            "fallback": 'The Backlog',
            "color": "info",
            "actions": [{
                "name": "backlog",
                "text": "See Backlog",
                "value": "backlog",
                "type": "button",
                "style": "primary"
            }],
        }]}
    );
    return {}
});

slackMessages.action('vote_topic', (payload) => {
    console.log('action:vote_topic');
    const action = payload.actions[0];
    const voteIt = (payload) => {
        "use strict";
        console.log('[voteIt]');
        const userId = payload.user.id;

        function changeVotes(vote) {
            return parseInt(vote) ? {"$inc": {"votes": 1}} : {"$inc": {"votes": -1}};
        }

        function addVote(doc) {
            console.log('Adding vote...');

            if (typeof doc.votes[userId] === 'undefined') {
                console.log('new vote added');
                doc.votes[userId] = [action.name];
            } else {
                if (doc.votes[userId].length === general.votesCount) {
                    console.log('add vote rejected');
                    return false
                }
                console.log('next vote added');
                doc.votes[userId].push(action.name);
            }
            return true;
        }

        function revokeVote(doc) {
            console.log('Revoking vote...');

            if (typeof doc.votes[userId] === 'undefined') {
                console.log('nothing to revoke');
                return false;
            } else {
                console.log('vote revoked');
                const index = doc.votes[userId].indexOf(action.name);
                if (index !== -1) doc.votes[userId].splice(index, 1);
            }
            return true;
        }

        db.discussions.findOne(
            {status: statuses.active},
            (err, doc) => {
                let voteChanged = null;
                if (parseInt(action.value)) {
                    voteChanged = addVote(doc);
                } else {
                    voteChanged = revokeVote(doc);
                }
                if (voteChanged) {
                    db.discussions.update(
                        {status: statuses.active},
                        doc,
                        (err, updCount) => {
                            console.log('updated', updCount, doc);
                            db.topics.update(
                                {_id: action.name},
                                changeVotes(action.value),
                                (err, updated) => {
                                    console.log(`${updated} topic updated [${action.name}]`);
                                    showAgenda(payload.channel.id, payload.user.id, {
                                        text: ((vote) => {
                                            return [
                                                [
                                                    `*Number ${payload.attachment_id} - booo!..*\n`,
                                                    `*Yeah... Number ${payload.attachment_id} isn't good enough...*\n`,
                                                    `*Number ${payload.attachment_id}! Must die!*\n`,
                                                ],
                                                [
                                                    `*Number ${payload.attachment_id}! Good choice!*\n`,
                                                    `*Sold! Number ${payload.attachment_id}!*\n`,
                                                    `*Excellent! Number ${payload.attachment_id}! I knew it!*\n`,
                                                ]
                                            ][vote][Math.floor(Math.random() * 3)];
                                        })(action.value),
                                        ts: payload.message_ts,
                                    });
                                }
                            )
                        }
                    );
                }
            }
        );

    };

    voteIt(payload);

});

slackMessages.action('show_backlog', (payload) => {
    console.log('`show_backlog` action');
    const action = payload.actions[0];

    if (action.value === 'backlog') {
        console.log('Seeing Backlog...');
        showTopics(payload.channel.id, payload.user.id)
    }
});

module.exports = {
    slackMessages
};
