const NEDb = require('nedb');
const db = require('./app');

const {general, discussion} = require('./options');


db.discussions = new NEDb({ filename: 'discussions.db', autoload: true });

// MESSAGES:
const initDiscussionMessage = {
    'text': 'Hurray! Initiating new discussion...'
};

const formatSuccessMessage = (day, time, place) => (
    `Yuhoo! Can't wait for it!..\nSee ya ${day} at ${time} in the ${place}!`
);

// TODO: date/time handling
const initDiscussionDialog = JSON.stringify({
    "callback_id": "init_discussion",
    "title": "New LeanCofee discussion",
    "submit_label": "Initiate",
    "elements": [
        {
            "type": "text",
            "label": "Pick the day",
            "name": "discussion_day",
            "hint": "When will it happen? Don't change it, for now ;)",
            "value": discussion.defaults.day,
        },
        {
            "type": "select",
            "label": "Time",
            "name": "discussion_time",
            "hint": "What time is suitable?",
            "value": discussion.defaults.time,
            "placeholder": "Pick a time!",
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
            "hint": "We can do it everywhere! (...even in Space)",
            "value": discussion.defaults.place,
        }
    ]
});

const getNextFriday = () => '2018-02-16';  // TODO: smarter

const initDiscussion = (options) => {
    console.log('Creating new Discussion...');
    db.discussions.insert({
        "day": options.discussion_day === discussion.defaults.day ? getNextFriday() : options.day,
        "time": options.discussion_time,
        "place": options.discussion_place,
        "status": discussion.statuses.idle,
        "agenda": []    // TODO: add from Backlog
    });
    db.discussions.find({}, function(err, qs) {
        console.log('from DB', qs);
    });
};

module.exports = {
    initDiscussion,
    initDiscussionMessage,
    initDiscussionDialog,
    formatSuccessMessage,
};

// db.insert({
//     "options": {
//         "quorum": 5,
//         "agendaScope": 3,
//         "votesCount": 2,
//         "secretMode": false
//     }
// });
//
// db.findOne({}, function (err, qs) {
//     console.log(qs.options.quorum);
// });
