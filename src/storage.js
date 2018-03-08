/** STATE persistence (Node Embedded Data Base)
*/

const NEDb = require('nedb');


db = {};
db.discussions = new NEDb({ filename: 'data/discussions.db', autoload: true });
db.topics = new NEDb({ filename: 'data/topics.db', autoload: true });

module.exports = db;
