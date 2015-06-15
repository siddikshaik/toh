var dbConfig = {
	client: 'mysql',
	connection: {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'toh',
		charset: 'UTF8'
	}
}

var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = {
		DB : bookshelf,
		knex: knex
};
