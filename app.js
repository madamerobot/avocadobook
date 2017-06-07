//---------CONFIG AND LIBRARIES-----------------

//Requiring Sequelize library & initiating db connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://daisy:Duck@localhost/avocadonet');

//Requiring express library
const express = require('express');
//Initialising express library
const app = express();
//Requiring express-session
var session = require('express-session')

//Requiring file system library
const fs = require('fs');

//Requiring body parser library
//This adds a body property to the request parameter of every app.get and app.post
const bodyParser = require('body-parser');
//Initialising body-parser li;brary
app.use('/', bodyParser())
app.use(bodyParser.urlencoded({
	extended: false
}))

//Setting PUG view engine
app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));

//Requiring postgres library
const pg = require('pg');

//------------DEFINING DATABASE MODELS
var User = sequelize.define('user', {
	name: Sequelize.STRING,
	password: Sequelize.STRING
});

var Post = sequelize.define('post', {
	post: Sequelize.STRING
});

var Comment = sequelize.define('comment', {
	comment: Sequelize.STRING
});

//Defining dependencies

//A user can write many posts
User.hasMany(Post);
//A post only belongs to one user
Post.belongsTo(User);

//A user can write many comments
User.hasMany(Comment);
//A comment only belongs to one user
Comment.belongsTo(User);

//Many comments belong to a post
Post.hasMany(Comment);
//A comment only belongs to one post
Comment.belongsTo(Post);

//----------------ROUTES----------------

//ROUTE 01: WRITING A NEW POST
app.get('/addpost', function(req,res) {
	res.render("addpost");
})

//Global variable to use outside of function scope
var inputmessage = [];

app.post('/addpost', function(req,res) {
	
	inputmessage = req.body.posting;
	console.log('I receive this input as new posting: '+inputmessage);
	res.render("post", {postingcontent: inputmessage});	

	// Creating a new posting
	sequelize
		.sync({force: true})
		.then(function(){
			return Post.create({
			post: inputmessage 
			});
		});
});

//ROUTE 02: WRITING A COMMENT
app.post('/post', function(req, res){

	var inputcomment = req.body.comment;
	console.log('I receive this input as new comment: '+inputcomment);
	var userComments = [];

	// Creating new comment
	Comment.create({
		comment: inputcomment 
	})
	.then( () => {
		//Getting all comments from db and storing in variable 'usercomments'
		Comment.findAll().then(function(rows) {
			for(var i = 0; i < rows.length; i++) {
				var columnData = rows[i].dataValues;
				var userComments = columnData.comment;
				console.log('These are all comments in the database: '+userComments);
			}
			res.render("post", {postingcontent: inputmessage, comments: userComments});
		});
	})
});

//ROUTE 03: SIGN IN
app.get('/', function(req,res){
	res.render("home");
})

app.post('/', function(req,res) {
	//get req.body.username
	//get req.body.password
	//for (var i = 0, i<userbase.length; i++)
	//if req.body.username === userbase.username[i] && req.body.password === userbase.password[i]
	//res.render("profile")
	//else
	//res.send("signup");
})

//ROUTE 04: CREATE A NEW USER
app.get('/signup', function(req,res){
	res.render("signup");
})

app.post('/signup', function(req,res){

	var inputname = req.body.username;
	var inputpassword = req.body.password;

	console.log("I am receiving following user credentials: "+inputname+" "+inputpassword);

	//Creating new user
	User.create({
		name: inputname,
		password: inputpassword
	})
	.then( () => {
		res.render("profile", {
			username: inputname
		});
	});
})

//ROUTE 05: DISPLAY ALL POSTINGS OF A SINGLE USER
app.get('/profile', function(req,res) {
	//get all postings from one user from db
	res.render("profile", {userpostings: userpostings});
})

//ROUTE 06: DISPLAY ALL POSTINGS OF ALL USERS
app.get('/allpostings', function(req,res) {
	//get all postings from all users from db
	res.render("allpostings", {allpostings: allpostings});
})

//------------DEFINING PORT 8080 FOR SERVER----------------------
var server = app.listen(8080, () => {
	sequelize.sync({force: true})
	console.log('Yo, this http://localhost is running:' + server.address().port);
});