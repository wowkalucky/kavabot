const {db} = require('./storage');
const {discussion, statuses} = require('./options');


// MESSAGES:
const initDiscussionMessage = {
    'text': 'Hurray! Initiating new discussion...'
};

const formatSuccessDiscussionMessage = (day, time, place) => (
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
    console.log('Gathering Backlog topics...');
    db.topics.find({status: statuses.idle}, (err, qs) => {
        const backlogIds = qs.map((topic) => topic._id);

        console.log('Creating new Discussion...');
        db.discussions.insert({
            day: options.discussion_day === discussion.defaults.day ? getNextFriday() : options.day,
            time: options.discussion_time,
            place: options.discussion_place,
            status: statuses.active,
            agenda: backlogIds,
        },
        (err, newDiscussion) => {
            console.log('Activating Backlog...');
            db.topics.update(
                {status: statuses.idle},
                {$set: {status: statuses.active, discussion: newDiscussion._id}},
                {}, (err, numActivated) => {
                    console.log(`${numActivated} Backlog topics activated...`);
                }
            );
        });
    });
};

module.exports = {
    initDiscussion,
    initDiscussionMessage,
    initDiscussionDialog,
    formatSuccessDiscussionMessage,
};
