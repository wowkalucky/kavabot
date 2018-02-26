require('dotenv').config();

module.exports = {
    general: {
        quorum: 5,
        agendaScope: 3,
        votesCount: 2,
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
            name: "botex",
        },
    }
};
