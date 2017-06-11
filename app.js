//---------CONFIG AND LIBRARIES-----------------

//Requiring Sequelize library & initiating db connection
const Sequelize = require('sequelize');
const sequelize= new Sequelize('postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/avocadonet');

//Requiring express library
const express = require('express');
//Initialising express library
const app = express();
//Requiring express-session
var session = require('express-session')
//Initialising session
app.use(session({
	secret: 'Heckmeck am Bratwurmeck',
	resave: true,
	saveUninitialized: false
}));

//Requiring file system library
const fs = require('fs');

//Requiring body parser library
//This adds a body property to the request parameter of every app.get and app.post
const bodyParser = require('body-parser');
//Initialising body-parser li;brary
app.use(bodyParser.urlencoded({
	extended: false
}))
app.use(bodyParser.json())

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
	post: Sequelize.STRING,
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

//ROUTE 01: HOME------------------------
app.get('/', function(req, res){

	var user = req.session.user;
	var message = req.query.message;

	res.render("home", {user: user, message: message});

});

//CHECKING IF FORM INPUT USERDATA MATCHES DATABASE ENTRY. IF YES, ASSIGN SESSION TO USER.
app.post('/', function (req, res) {

	console.log('This is what I get: '+req.body.username+" "+req.body.password);

	if(req.body.username.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		return;
	}

	if(req.body.password.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}

	User.findOne({
		where: {
			name: req.body.username
		}
	}).then(function (user) {
		if (user !== null && req.body.password === user.password) {
			req.session.user = user;
			res.redirect(`/profile/${user.name}`);
		} else {
			res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		}
	}, function (error) {
		res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
});


//ROUTE 02: CREATING NEW USER IN SIGNUP-------------
app.get('/signup', function(req, res){
	res.render("signup");
})

app.post('/signup', function(req, res){

	var inputname = req.body.username;
	var inputpassword = req.body.password;

	console.log("I am receiving following user credentials: "+inputname+" "+inputpassword);

	User.create({
		name: inputname,
		password: inputpassword 
	}).then( () => {
		res.redirect('/?message=' + encodeURIComponent("Your user got successfully created. Log in below."));
	});
})

//ROUTE 03: WRITING A NEW POST---------------------
app.get('/addpost', function (req, res) {

	const user = req.session.user;

	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		res.render("addpost");
	}
});

app.post('/addpost', function(req, res) {
	
	var user = req.session.user.name;
	var inputmessage = req.body.posting;
	console.log('I receive this input as new posting: '+inputmessage);
	console.log('I receive this input as user info: '+user);

	User.findOne({
		where: {
			name: user
		}
	})
	.then(function(user){
		return user.createPost({
			post: inputmessage
		})
	})
	.then( post => {
		res.redirect(`/posts/${post.id}`);
	})
});

//ROUTE 04: DISPLAYING SINGLE POST PAGE INCLUDING USER COMMENTS

app.get('/posts/:postId', function(req, res){
	
	const postId = req.params.postId;
	console.log('This is what I receive as postId in the postId get request: '+postId);

	Post.findOne({
		where: {
			id: postId
		},
		include: [{
			model: Comment
		}]
	})
	.then(function(post){
		console.log(JSON.stringify(post, null, 2));
		console.log(post.comments);
		res.render("post", {postingcontent: post.post, comments: post.comments, postId: postId});
	})
});

//ROUTE 05: REDIRECTING COMMENT CREATION TO SEPERATE ROUTE, 
//SO THAT DATA HANDLING IS MORE TRANSPARENT

app.post('/comment/:postId', function(req, res) {

	const postId = req.params.postId;
	console.log('This is what I receive as postId in the comment post request: '+postId);
	const user = req.session.user.name;
	console.log('I see this as session user in the comment post request: '+user);
	const inputcomment = req.body.comment;
	console.log('I receive this input as new comment in the comment post request: '+inputcomment);

	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		User.findOne({
			where: {
				name: user
			}
		})
		.then(function(user){
			console.log('Seq finds this user: '+user);
			return user.createComment({
				comment: inputcomment,
				postId: postId
			})
		}) 
		res.redirect(`/posts/${postId}`)
	}
});
	
//ROUTE 06: DISPLAYING ALL POSTINGS OF A SINGLE USER------------
app.get('/profile/:username', function (req, res) {

	var username = req.params.username;
	var user = req.session.user;
	var thisuserid;

	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		
		User.findOne({
			where: {
				name: username
			}
		}).then(function(user){
			console.log('---------->'+user.id);
			thisuserid = user.id;
		});

		Post.findAll({
			include: [User],
			where: {
				userId: thisuserid
			}
		})
		.then(function(alluserpostings){	
			console.log(JSON.stringify(alluserpostings, null, 2));
			res.render("profile", {alluserpostings: alluserpostings, username: username});
		});
	}
});

//ROUTE 07: DISPLAYING ALL POSTINGS OF ALL USERS----------------
app.get('/allpostings', function (req, res) {

	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		Post.findAll({
			include: [User]
		}).then(function(allpostings){	
			console.log(JSON.stringify(allpostings, null, 2));
			res.render("allpostings", {allpostings: allpostings});
		});
	}
});

//ROUTE 08: SIGN OUT--------------------------------------------
app.get('/logout', function (req, res) {

	req.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

//------------DEFINING PORT 8080 FOR SERVER----------------------
var server = app.listen(8080, () => {
	sequelize.sync({force: false})
	console.log('Yo, this http://localhost is running:' + server.address().port);
});