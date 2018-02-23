const {WebClient} = require('@slack/client');

const db = require('./storage');
const {statuses, ages, general} = require('./options');
const {showAgenda} = require('./discussion');


const web = new WebClient(process.env.WEB_API_TOKEN);

// MESSAGES:
const initTopicMessage = {
    "text": "Let's write it down..."
};
const voteTopicMessage = {
    "text": "Composing Backlog..."
};
const voteMessage = {
    "text": `*Here the list of proposed Topics (aka Backlog)!*\n
_NOTES:_
:bulb: _the top most voted *${general.agendaScope}* topics (green highlighted) are the winners and will compose the Agenda._
:pushpin: _:new: new ones (yellow highlighted)_
:pushpin: _you may notice the topic popularity by corresponding icons:_ HOT(10+):fire:, WARM(5+) :hotsprings:
:pushpin: *_don't be so shy - you'll be able to re-vote at any time till Discussion deadline!_*
\n`
};
const backlogMessage = {
    "text": `*The Backlog*\n\nThere is *no opened Discussion* right now.\nSo voting isn't available.`
};
// DIALOGS:
const initTopicDialog = JSON.stringify({
    "callback_id": "init_topic",
    "title": "New LeanCofee Topic",
    "submit_label": "Submit!",
    "elements": [
        {
            "type": "text",
            "label": "Title",
            "name": "topic_title",
            "hint": "What do you want to discuss in one phrase",
            "placeholder": "Formulate it concise!",
        },
        {
            "type": "textarea",
            "label": "Try to explain the Topic",
            "name": "topic_body",
            "hint": "Make it clear what has been bothered you all this time (up to 500 characters)",
            "placeholder": "Write your essay here!",
            "max_length": 500,
        },
        {
            "type": "text",
            "subtype": "url",
            "label": "Have related link?",
            "name": "topic_url",
            "optional": "true",
            "hint": "Useful or useless url to discover the problem",
            "placeholder": "http://leancoffee.org/",
        }
    ]
});


const formatSuccessTopicMessage = (name) => (
    `*Submitted!* \nI'll remind you about the event on the eve, *${name}*. \nNow, back to work!
     \nOr... You may take a look on the Backlog :thinking_face:`
);

const initTopic = (options) => {
    console.log('Fetching active Discussion...');
    db.discussions.findOne({status: statuses.active}, (err, qs) => {
        const discussionOpened = !!qs;
        console.log('New topic creation...');
        db.topics.insert({
            title: options.topic_title,
            description: options.topic_body,
            url: options.topic_url,
            author: options.author,
            status: discussionOpened ? statuses.active : statuses.idle,
            age: ages.new,
            votes: 0,
            totalVotes: 0,
            ts: options.ts,
            discussion: discussionOpened ? qs._id : null,
        },
        (err, newTopic) => {
            console.log(`Adding new Topic to ${discussionOpened ? 'Agenda' : 'Backlog'}...`);
            if (discussionOpened) {
                db.discussions.update(
                    {$set: {agenda: [...qs.agenda, newTopic._id]}},
                    {}, (err, numUpdated) => {
                        console.log(`New topic added to Agenda: ${newTopic.title}`);
                    }
                )}
            }
        );
    });
};

const showBacklog = (channelId, message) => {
    "use strict";
    console.log('[showBacklog]');

    db.topics
        .find({status: statuses.idle})
        .sort({age: 1, totalVotes: -1})
        .exec((err, topics) => {
            const backlog = topics.map((topic) => {
                const fresh = topic.age === ages.new;
                return {
                    "callback_id": "show_backlog",
                    "fallback": topic.title,
                    "color": fresh ? "warning" : "info",
                    "title": `${fresh ? ':new: ' : ''} ${topic.title}`,
                    "title_link": topic.url,
                    "text": topic.description,
                    "footer": `<@${topic.author.id}>  |  ${topic.totalVotes}`,
                    "footer_icon": "https://avatars3.githubusercontent.com/u/11388447?s=200&v=4",
                    "ts": topic.ts,
                }
            });
            console.log('posting message...');
            web.chat.postMessage(channelId, message.text, {attachments: backlog});
        }
    );
};

const showTopics = (channelId, userId, message) => {
    "use strict";
    db.discussions.findOne(
        {status: statuses.active},
        (err, doc) => {
            if (doc) {
                showAgenda(channelId, userId, message || voteMessage);
            } else {
                showBacklog(channelId, message || backlogMessage);
            }
        }
    );
};

module.exports = {
    initTopicMessage,
    voteTopicMessage,
    voteMessage,
    backlogMessage,
    initTopicDialog,
    initTopic,
    formatSuccessTopicMessage,
    showBacklog,
    showTopics,
};
