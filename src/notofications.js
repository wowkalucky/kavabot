const {showAgenda} = require('./discussion');


const newAgendaNotify = (channelId) => {
    const message = {
        text: `So, we have the winners!\nHere's the Agenda for our Lean Coffee Party.\n `
    };

    showAgenda(channelId, message)
};


module.exports = {
    newAgendaNotify,
};
