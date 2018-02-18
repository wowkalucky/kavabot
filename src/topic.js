const {db} = require('./storage');
const {statuses} = require('./options');


// MESSAGES:
const initTopicMessage = {
    "text": "Let's write it down..."
};

const formatSuccessTopicMessage = (name) => (
    `Submitted! I'll remind you about the event on the eve, ${name}. \nNow, back to work!`
);

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

const initTopic = (options) => {
    console.log('Fetching active Discussion...');
    db.discussions.findOne({status: statuses.active}, (err, qs) => {
        const discussionOpened = !!qs;
        console.log('New topic creation...');
        db.topics.insert({
            title: options.topic_title,
            description: options.topic_body,
            url: options.topic_url,
            status: discussionOpened ? statuses.active : statuses.idle,
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

module.exports = {
    initTopicMessage,
    initTopicDialog,
    initTopic,
    formatSuccessTopicMessage,
};
