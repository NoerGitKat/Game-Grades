//Modules
const express = require('express');
const app = express();
const session = require('express-session');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
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

app.use(express.static("public"));
app.use('/', bodyParser());
app.use(fileUpload());
app.set('views', 'public/views');
app.set('view engine', 'pug');

//Models
var User = db.define('user', {
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

var Picture = db.define('picture', {
	picture: Sequelize.STRING
})

db.sync({ force: false });

//Relationships
User.hasOne(Picture);
Picture.belongsTo(User);

//Routes
app.get('/', (req, res) => {
	var user = req.session.user;
	res.render('index', {
		user: user
	});
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

app.post('/login', (req, res) => {
	User.findOne({
		where: {
			username: req.body.username
		}
	})
	.then((user) => {
		var password = req.body.password
		bcrypt.compare(password, user.password, (err, data) => {	//validate password
			if (err) throw err;
			if (user !== null && data == true) {
				req.session.user = user;				//this starts session for user
				res.redirect('/profile');
			} 
			else {
				res.redirect('/login?message=' + encodeURIComponent("Invalid username or password."));
			}
		});
	})
	.catch((error) => {
		res.redirect('/?message=' + encodeURIComponent('Error has occurred. Please check the server.'));
	});
});

app.get('/profile', (req, res) => {
	var user = req.session.user;

    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view your profile."));
    } else {
    	Picture.findOne({
    		where: {
    			userId: user.id
    		}
    	}).then((picture)=>{
	        res.render('profile', {
	            user: user,
	            picture: picture
	        });
    	})
    	.catch((error) => { console.log("Beep boop, error has occurred: " + error)})
    }
});

//Log out route that redirects to home
app.get('/logout', (req, res) => {
	req.session.destroy(function(error) {			//destroy session after logout
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	});
});

//Tetris Game Level 1
app.get('/tetris', (req, res) => {
	var user = req.session.user;
	res.render('tetris');
});

app.post('/upload', function(req, res) {
	console.log(req.files);
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	}
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
	let picture = req.files.picture;
	let picturelink = `public/img/profile_pic/${user.id}.jpg`;
	let databaseLink = `../img/profile/${user.id}.jpg`;
 
  // Use the mv() method to place the file somewhere on your server 
  picture.mv(picturelink, function(err) {
    if (err)
      return res.status(500).send(err);
 	else {
 		return Picture.create({
 			picture: databaseLink,
 			userId: user.id
 		})
 		.then(() => {
 			res.redirect('/profile');
 		})
 		.catch((error) => { console.log('Beep boop, error has occurred: ' + error) })
	}
    res.send('File uploaded!');
  });
});

app.get('/about', (req, res) => {
	res.render('about');
});

app.get('/class', (req, res) => {
	var user = req.session.user;

	if(user) {
		res.render('class');
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please log in to go to class."));
	}
});

app.get('/resources', (req, res) => {
	var user = req.session.user;
	
	if (user) {
		res.render('resources',
			{
				user: user
			});
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please log in to view resources."));
	}
	
});



const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});