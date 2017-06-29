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
		timestamps: false
	}
})

//Settings
app.use('/', bodyParser());
app.use(session({
	secret: `${process.env.SECRET_SESSION}`,
	resave: true,
	saveUninitialized: false
}));

app.use('/', bodyParser());

app.set('views', 'public/views');
app.set('view engine', 'pug');
app.use(express.static("public"));

//Models
const User = db.define('user', {
	username: {
		type: Sequelize.STRING,
		unique: true
	},
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: {
		type: Sequelize.STRING,
    	unique: true
    },
	age: Sequelize.INTEGER,
	password: Sequelize.STRING,
	likesgames: Sequelize.BOOLEAN
});

db.sync({ force: true });

//Routes
app.get('/', (req, res) => {
	res.render('index');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	var password = req.body.password;
	bcrypt.hash(password, null, null, (err, hash) => {
		if (err) {
			throw err
		}
		User.create({
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			age: req.body.age,
			password: hash,
			likesgames: req.body.checkbox
		})
	})
	res.redirect('/login');
	
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/profile', (req, res) => {
	res.render('profile');
});

//Tetris Game Level 1
app.get('/tetris', (req, res) => {
	res.render('tetris');
});

//Quiz level 1
//Snake Game Level 2
//Quiz level 2
//Pacman Game level 3
//Quiz level 3

const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});