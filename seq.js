var seq = function() {
	
	//Requiring express library
	const express = require('express');
	//Initialising express library
	const app = express();
	//Requiring Sequelize library & initiating db connection
	const Sequelize = require('sequelize');
	const sequelize = new Sequelize('postgres://daisy:Duck@localhost/avocadonet');

	//Defining Models
	var User = sequelize.define('user', {
		name: Sequelize.STRING,
		password: Sequelize.STRING
	});

	var Post = sequelize.define('post', {
		post: Sequelize.STRING
	});

	var Comment = sequelize.define('comment', {
		comment: Sequelize.STRING,
	});

	//Defining dependencies
	User.hasMany(Post);
	Comment.belongsTo(Post);
	Post.hasMany(Comment);
	Comment.belongsTo(User);

}
module.exports.seq = seq;