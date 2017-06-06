//---------CONFIG AND LIBRARIES-----------------

//Sequelize
const Sequelize = require('sequelize');
var seq = require('./seq.js');
seq.seq();

//Requiring express library
const express = require('express');
//Initialising express library
const app = express();

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

//----------------ROUTES----------------

//ROUTE 01: WRITING A NEW POST
app.get('/addpost', function(req,res) {
	res.render("addpost");
})

app.post('/addpost', function(req,res) {
	
	var inputmessage = req.body.posting;
	console.log(inputmessage);
	res.render("post", {postingcontent: inputmessage});	

	//Establishing database connection
	const sequelize = new Sequelize('postgres://daisy:Duck@localhost/avocadonet');

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
	//get req.body.comment
	//send comment to db
	//display comment
})

//ROUTE 03: LOGIN
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

//ROUTE 04: SIGN UP
app.get('/signup', function(req,res){
	res.render("signup");
})

app.post('/signup', function(req,res){
	//get req.body.username
	//get req.body.password
	//send to db
	//res.render("profile");
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
	console.log('Yo, this http://localhost is running:' + server.address().port);
});