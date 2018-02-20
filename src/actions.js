const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/client');
require('dotenv').config();

const {initDiscussion, formatSuccessDiscussionMessage, showAgenda} = require('./discussion');
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
    const message = formatSuccessDiscussionMessage(
        payload.submission.discussion_day,
        payload.submission.discussion_time,
        payload.submission.discussion_place
    );
    showAgenda(payload.channel.id, payload.user.id, message);

    return {}
});

slackMessages.action('init_topic', (payload) => {
    // console.log('payload', payload);

    initTopic({
        ...payload.submission,
        ts: payload.action_ts,
        author: payload.user
    });

    // send success message:
    web.chat.postEphemeral(
        payload.channel.id,
        formatSuccessTopicMessage(payload.user.name),
        payload.user.id
    );
    return {}
});

slackMessages.action('vote_topic', (payload) => {
    // console.log('payload', payload);

    // payload {
    //     type: 'interactive_message',
    //     actions: [ { name: '8uWrogIHZlPs2ED1', type: 'button', value: '1' } ],
    //     callback_id: 'vote_topic',
    //     team: { id: 'T6K8HJZQW', domain: 'slatyne' },
    //     channel: { id: 'C94H16BPX', name: 'botex' },
    //     user: { id: 'U6J9K847M', name: 'wowkalucky' },
    //     action_ts: '1518990009.973617',
    //     message_ts: '1518989894.000022',
    //     attachment_id: '5',
    //     token: '8wIvXEnO3Dp0VB1yd2kljBOP',
    //     is_app_unfurl: false,
    //     response_url: 'https://hooks.slack.com/actions/T6K8HJZQW/317012342450/63SFMDvUfBrE1DFhkTaJQo8L',
    //     trigger_id: '317012342498.223289645846.0c7575f099b640d8250ef2f33ee921db'
    // }

    // updateTopic(payload.actions.name, payload.actions.value, payload.user.id);
    
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
        })(payload.actions[0].value),
        ts: payload.message_ts,
    });
    // return {}
});

module.exports = {
    slackMessages
};
