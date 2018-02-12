// "response_type": "in_channel"

// response_url = delayed responses; 5*30min
// content-type: application/json
// dialog.open trigger_id

const Nedb = require('nedb');

// db = new Nedb({ filename: 'leancoffee.db', autoload: true });
//
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


const getNextFriday = () => '2018-02-16';

const initDiscussion = () => {
    "use strict";
    const options = {
        day: getNextFriday(),
    };
    console.log('Creating new Discussion...');
};

module.exports = {
    initDiscussion,
};
