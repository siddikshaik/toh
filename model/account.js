var DB = require('./db').DB;

var user = DB.Model.extend({
	tableName: 'account'
});

module.exports = {
		user: user
};