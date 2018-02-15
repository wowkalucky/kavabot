const NEDb = require('nedb');


db = {};
db.discussions = new NEDb({ filename: 'discussions.db', autoload: true });
db.topics = new NEDb({ filename: 'topics.db', autoload: true });

module.exports = {
    db,
};
