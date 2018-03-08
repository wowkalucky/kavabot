/** INTERACTIVE ACTIONS (buttons, dialogs)
*/

const {WebClient} = require('@slack/client');

const {getTargetChannelIdPromise} = require('./utils');
const {botOpts} = require('./options');
const {showAgenda} = require('./discussion');


const web = new WebClient(process.env.WEB_API_TOKEN);


const newAgendaNotify = (userId) => {
    const message = {
        text: `So, <!channel>, we have the winners!\n 
        Here's the Agenda for our Lean Coffee Party.\n `
    };
    getTargetChannelIdPromise(botOpts.targetChannel.name).then((channelId) => {
        showAgenda(channelId, userId, message)
    })
};

const newDiscussionNotify = (data) => {
    const message = {
        text: `*Attention! Увага! Achtung!*\n
            
<!channel>
New Lean Coffee Time is initiated!\n
DATE: ${data.discussion_day} | TIME: ${data.discussion_time} | PLACE: ${data.discussion_place}\n
You are welcome to submit your _awesome | ridiculous | horrible_ topics.\n

:bulb: */lc-topic* command ~~or *@kavabot topic* mention~~ - to submit new topic\n
:bulb: */lc-vote* command ~~or *@kavabot vote* mention~~ - to make your voting\n
*golosuj! ...ili proigraisch!*\n
            `
    };
    web.chat.postMessage(
        botOpts.targetChannel.id,
        message.text,
        {
            attachments: [{
                "callback_id": "show_backlog",
                "fallback": 'The Backlog',
                "color": "info",
                "actions": [{
                    "name": "backlog",
                    "text": "Vote it!",
                    "value": "backlog",
                    "type": "button",
                    "style": "primary"
                }],
            }]
        }
    );
};


module.exports = {
    newAgendaNotify,
    newDiscussionNotify,
};
