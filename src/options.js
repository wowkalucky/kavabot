require('dotenv').config();

module.exports = {
    general: {
        quorum: 5,
        agendaScope: process.env.AGENDA_SCOPE || 3,
        votesCount: process.env.VOTE_COUNT || 2,
        notifications: true,
    },
    discussion: {
        defaults: {
            day: "This Friday!",
            time: "13:00",
            place: "Basement Hall"
        },
    },
    statuses: {
        idle: "idle",
        active: "active",
        archived: "archived"
    },
    ages: {
        old: "old",
        new: "new",
    },
    botOpts: {
        id: process.env.BOT_USER_ID,
        targetChannel: {
            id: process.env.TARGET_CHANNEL_ID,
            name: process.env.TARGET_CHANNEL_NAME || "botex",
        },
    }
};
