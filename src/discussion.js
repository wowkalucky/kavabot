const {WebClient} = require('@slack/client');

const db = require('./storage');
const {general, discussion, statuses, ages, bot} = require('./options');


const web = new WebClient(process.env.WEB_API_TOKEN);

// MESSAGES:
const initDiscussionMessage = {
    'text': 'Hurray! Initiating new discussion...'
};

const closeDiscussionMessage = {
    'text': 'Closing current discussion... ' +
    '\nThat it for now! Topics from Agenda are being marked as Archived for the history.'
};

const formatSuccessDiscussionMessage = (day, time, place) => ({
    text: `Yuhoo! Can't wait for it!..\nSee ya ${day} at ${time} in the ${place}!` +
    '\n\n FYI, here is current Agenda:'
});

const getNextFriday = (time) => {
    const d = new Date();
    d.setDate(d.getDate() + (5 + 7 - d.getDay()) % 7);
    if (time) {
        d.setTime(time);
    }
    return d
};

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
            "value": `${getNextFriday().toLocaleDateString()} | This Friday!`,
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

const initDiscussion = (options) => {
    console.log('[initDiscussion]');
    const dateStr = options.discussion_day.split(' | ')[0];
    const dateTime = new Date(dateStr);
    dateTime.setUTCHours(options.discussion_time.split(':')[0]);

    console.log('Creating new Discussion...');
    db.discussions.insert(
        {
            day: dateStr, // TODO: optional any date
            time: options.discussion_time,
            dateTime: dateTime,
            place: options.discussion_place,
            status: statuses.idle,
            agenda: [],
            votes: {},
        },
        (err, newDiscussion) => {
            console.log('Activating Backlog...');
            db.topics.update(
                {status: statuses.idle},
                {$set: {status: statuses.active, discussion: newDiscussion._id}},
                (err, numActivated) => {
                    console.log(`${numActivated} Backlog topics activated...`);
                }
            );
        }
    );
};

// TODO: closeDiscussion;
const closeDiscussion = () => {
    "use strict";
    console.log('[closeDiscussion]');

    db.discussions.update(
        {status: statuses.active},
        {$set: {status: statuses.archived}},
        (err, numArch) => {
            console.log(`${numArch} Discussion archived...`);
        //    for all topic in Agenda -> change status to Archived, age to old and count totalVotes

        }
    );
};

const showVoteList = (channelId, userId, message) => {
    console.log('[showVoteList]');

    function makeActions(topic, userVotes) {
        "use strict";
        console.log('making actions...');
        console.log('userVotes', userVotes);

        let actions = [];
        if (typeof userVotes === 'undefined' || userVotes.length < general.votesCount) {
            actions.push(
                {
                    "name": topic._id,
                    "text": "Vote! :thumbsup:",
                    "value": 1,
                    "type": "button",
                    "style": "primary"
                },
            );
        }
        if (userVotes && userVotes.includes(topic._id)) {
            actions.push(
                {
                    "name": topic._id,
                    "text": "Unvote...",
                    "value": 0,
                    "type": "button",
                    "style": "danger"
                }
            );
        }
        return actions;
    }

    db.topics
        .find({status: {$ne: statuses.closed}})
        .sort({votes: -1, age: 1, totalVotes: -1})
        .exec((err, topics) => {
            db.discussions.findOne(
                {"status": statuses.idle},
                (err, doc) => {
                    const userVotes = doc.votes[userId];
                    const backlog = topics.map((topic, i) => {
                        const fresh = topic.age === ages.new;
                        const hot = topic.votes >= 10;
                        const warm = 10 > topic.votes && topic.votes > 5;
                        return {
                            "callback_id": "vote_topic",
                            "fallback": topic.title,
                            "color": i < general.agendaScope ? "good" : (fresh ? "warning" : "info"),
                            "title": `${fresh ? ':new: ' : ''}${hot ? ':fire: ' : ''}${warm ? ':hotsprings: ' : ''}${topic.title}`,
                            "title_link": topic.url,
                            "text": topic.description,
                            "footer": `<@${topic.author.id}>  |  ${topic.votes}`,
                            "footer_icon": "https://avatars3.githubusercontent.com/u/11388447?s=200&v=4",
                            "ts": topic.ts,
                            "actions": makeActions(topic, userVotes),
                        }
                    });
                    if ('ts' in message) {
                        console.log('updating message...');
                        web.chat.update(message.ts, channelId, message.text, {attachments: backlog});
                    } else {
                        console.log('posting message...');
                        web.chat.postMessage(userId, message.text, {attachments: backlog});
                    }
                }
            );
        }
    );
};

const showAgenda = (channelId, userId, message) => {
    console.log('[showAgenda]');

    db.discussions.findOne(
        {status: statuses.active},
        (err, doc) => {
            "use strict";
            if (!doc) {
                console.log('no active discussion', channelId, userId);
                web.chat.postEphemeral(channelId, "Sorry, there is no active Discussion!", userId);
                return
            }
            db.topics.find(
                {"_id": {$in: doc.agenda}},
                (err, topics) => {
                    console.log(`Found ${topics.length} topics for Agenda`);
                    const agenda = topics.map((topic) => {
                        const fresh = topic.age === ages.new;
                        const hot = topic.votes >= 10;
                        const warm = 10 > topic.votes && topic.votes > 5;
                        return {
                            "fallback": topic.title,
                            "color": "good",
                            "title": `${fresh ? ':new: ' : ''}${hot ? ':fire: ' : ''}${warm ? ':hotsprings: ' : ''}${
                                topic.title}`,
                            "title_link": topic.url,
                            "text": topic.description,
                            "footer": `<@${topic.author.id}>  |  ${topic.votes}`,
                            "footer_icon": "https://avatars3.githubusercontent.com/u/11388447?s=200&v=4",
                            "ts": topic.ts,
                        }
                    });
                    console.log('test', channelId, message.text, {attachments: agenda});
                    web.chat.postMessage(channelId, message.text, {attachments: agenda});
                }
            )
        }
    );
};

const composeAgenda = (notifyCb, channelId, userId, agendaScope) => {
    "use strict";
    console.log('[composeAgenda]');
    const scope = agendaScope || general.agendaScope;
    db.topics
        .find({status: {"$ne": statuses.archived}}, {_id: 1})
        .sort({votes: -1, age: 1, totalVotes: -1})
        .limit(scope)
        .exec((err, topics) => {
            const agendaIds = topics.map((topic) => topic._id);
            console.log('agendaIds', agendaIds);
            db.discussions.update(
                {status: statuses.idle},
                {"$set": {status: statuses.active, agenda: agendaIds}},
                (err, countUpd) => {
                    console.log(`New Agenda set to: ${agendaIds}`);
                    notifyCb(userId);
                }
            )
        }
    )
};

const checkDeadline = (deadLine) => {
    "use strict";
    console.log('[checkDeadline]');
    // is it Deadline to compose an Agenda?
    // TODO: count participants

};

module.exports = {
    initDiscussion,
    initDiscussionMessage,
    closeDiscussionMessage,
    initDiscussionDialog,
    formatSuccessDiscussionMessage,
    showVoteList,
    showAgenda,
    composeAgenda,
    closeDiscussion,
};
