//---------CONFIG AND LIBRARIES-----------------

const config = function() {

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
	const pg = require('pg')

}

//Exporting module
exports.config = config;