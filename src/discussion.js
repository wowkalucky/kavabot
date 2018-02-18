const { WebClient } = require('@slack/client');

const db = require('./storage');
const {discussion, statuses, ages} = require('./options');


const web = new WebClient(process.env.WEB_API_TOKEN);

// MESSAGES:
const initDiscussionMessage = {
    'text': 'Hurray! Initiating new discussion...'
};

const formatSuccessDiscussionMessage = (day, time, place) => (
    `Yuhoo! Can't wait for it!..\nSee ya ${day} at ${time} in the ${place}!` +
    '\n\n FYI, here is current Agenda:'
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

// TODO:
// const closeDiscussion;

const showAgenda = (payload) => {
    db.topics
        .find({status: {$ne: statuses.closed}})
        .sort({ age: 1 , votes: -1, totalVotes: -1})
        .exec((err, topics) => {
        const agenda = topics.map((topic) => {
            const fresh = topic.age === ages.new;
            const hot = topic.votes >= 10;
            const warm = 10 > topic.votes && topic.votes > 5;
            return {
                "fallback": topic.title,
                "color": fresh ? "warning" : "info",
                "title": `${hot ? ':fire: ' : ''}${warm ? ':hotsprings: ' : ''}${fresh ? ':new: ' : ''}${topic.title}`,
                "title_link": topic.url,
                "text": topic.description,
                "footer": `<@${topic.author.id}>  |  ${topic.votes}`,
                "footer_icon": "https://avatars3.githubusercontent.com/u/11388447?s=200&v=4",
                "ts": topic.ts,
                "actions": [
                    {
                        "type": "button",
                        "text": "Vote! :thumbsup:",
                        "url": "https://flights.example.com/book/r123456",
                        "style": "primary"
                    },
                    {
                        "type": "button",
                        "text": "Unvote...",
                        "url": "https://requests.example.com/cancel/r123456",
                        "style": "danger"
                    }
                ]
            }
        });
        web.chat.postEphemeral(
            payload.channel.id,
            formatSuccessDiscussionMessage(
                payload.submission.discussion_day,
                payload.submission.discussion_time,
                payload.submission.discussion_place
            ),
            payload.user.id,
            {attachments: agenda}
        );
    });
};


module.exports = {
    initDiscussion,
    initDiscussionMessage,
    initDiscussionDialog,
    formatSuccessDiscussionMessage,
    showAgenda,
};
