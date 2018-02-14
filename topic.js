const NEDb = require('nedb');
const db = require('./app');

const {statuses} = require('./options');

db.topics = new NEDb({ filename: 'topics.db', autoload: true });

// MESSAGES:
const initTopicMessage = {
    "text": "Let's write it down..."
};

const formatSuccessTopicMessage = (name) => `Submitted! I'll remind you about the event on the eve, ${name}. Now, back to work!`;

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
    console.log('New topic creation...');
    db.topics.insert({
        "title": options.topic_title,
        "description": options.topic_body,
        "url": options.topic_url,
        "status": statuses.idle,
    });
    db.topics.find({}, function(err, qs) {
        console.log('from DB', qs);
    });
};

module.exports = {
    initTopicMessage,
    initTopicDialog,
    initTopic,
    formatSuccessTopicMessage,
};
