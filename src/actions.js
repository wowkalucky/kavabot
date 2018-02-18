const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/client');
require('dotenv').config();

const {initDiscussion, formatSuccessDiscussionMessage} = require('./discussion');
const {initTopic, formatSuccessTopicMessage} = require('./topic');


const web = new WebClient(process.env.WEB_API_TOKEN);
const slackMessages = createMessageAdapter(process.env.VERIFICATION_TOKEN);

slackMessages.action('init_discussion', (payload) => {
    // console.log('payload', payload);
    // PAYLOAD:
    // {
    //     type: 'dialog_submission',
    //     submission: {
    //         discussion_day: 'This Friday!',
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
    web.chat.postEphemeral(
        payload.channel.id,
        formatSuccessDiscussionMessage(
            payload.submission.discussion_day,
            payload.submission.discussion_time,
            payload.submission.discussion_place
        ),
        payload.user.id
    );
    return {}
});

slackMessages.action('init_topic', (payload) => {
    // console.log('payload', payload);

    initTopic(payload.submission);

    // send success message:
    web.chat.postEphemeral(
        payload.channel.id,
        formatSuccessTopicMessage(payload.user.name),
        payload.user.id
    );
    return {}
});

module.exports = {
    slackMessages
};
