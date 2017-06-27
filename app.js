//Modules
const express = require('express');
const app = express();
const session = require('express-session');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const db = new Sequelize('gamegrades', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: true
	}
})

//Settings
app.use('/', bodyParser());
app.use(session({
	secret: `${process.env.SECRET_SESSION}`,
	resave: true,
	saveUninitialized: false
}));

app.set('views', 'public/views');
app.set('view engine', 'pug');
app.use(express.static("public"));

//Models
const User = db.define('user', {
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	age: Sequelize.INTEGER,
	likesgames: Sequelize.BOOLEAN
});

db.sync();

//Routes
app.get('/', (req, res) => {
	res.render('index');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	res.redirect('profile');
});

const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});