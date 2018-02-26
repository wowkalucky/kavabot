const {WebClient} = require('@slack/client');

const web = new WebClient(process.env.WEB_API_TOKEN);


module.exports = {
    getTargetChannelIdPromise: (chName) => {
        return web.channels
            .list()
            .then((response) => {
                const targetChannel = response.channels.filter((channel) => channel.name === chName);
                return targetChannel && targetChannel[0].id;
            }
        );
    },
    getBotUsersPromise: () => {
        return web.users
            .list()
            .then((response) => {
                return response.members.filter((user) => user.is_bot);
            }
        );
    },
};

