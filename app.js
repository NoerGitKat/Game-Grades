//Modules
const express = require('express');
const app = express();
const session = require('express-session');
const Sequelize = require('sequelize');
const fileUpload = require('express-fileupload');
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

app.use(express.static("public"));
app.use('/', bodyParser());
app.set('views', 'public/views');
app.use(fileUpload());
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
	likesgames: Sequelize.BOOLEAN,
	likesscience: Sequelize.BOOLEAN
});

var Picture = db.define('picture', {
	imageName: Sequelize.STRING
})

db.sync({ force: false });	//set to true to wipe db

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
	bcrypt.hash(password, null, null, (err, hash) => {		//Hashing for security
		if (err) {
			throw err
		}
		User.create({							//Creates new row in users
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			age: req.body.age,
			password: hash,
			likesgames: req.body.checkbox,
			likesscience: req.body.checkbox2
		})
	})
	res.redirect('/login');
	
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	User.findOne({							//look for user in db
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
			else if (req.body.username !== user.username || req.body.password !== user.username) {
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
app.get('/class/tetris', (req, res) => {
	var user = req.session.user;
	if (user) {						//only accessible for users
		res.render('tetris');
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please login to go to class."))
	}
});

app.post('/upload', (req, res) => {
	var user = req.session.user;		//relevant for creating userId
	if(!req.files) {
			return res.status(400).send('No files were uploaded.');
		} else {
			let picture= req.files.picture
			let dirPic= `public/img/profile_pic/${user.id}.jpg`
			let namePic= `../img/profile_pic/${user.id}.jpg`
			picture.mv(dirPic, (err)=>{
				if (err) {
					throw err
				} else {	
					return Picture.create({			//creates picture with link to user
						imageName: namePic,
						userId: user.id
					})
					.then(()=>{
						res.redirect('/profile');
					})
					.catch((error) => { console.log("Beep boop, an error has occurred: " + error) });
				}
			})
		}	
});

app.get('/about', (req, res) => {
	res.render('about');
});

app.get('/class', (req, res) => {
	var user = req.session.user;

	if(user) {					//only accessible for users
		res.render('class');
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please log in to go to class."));
	}

});

app.get('/class/quiz', (req, res) => {
	var user = req.session.user;

	if (user) {					//only accessible for users
		res.render('quiz',
		{
			user: user
		});
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please log in to go to class."));
	}
});

app.get('/class/science', (req,res) => {
	var user = req.session.user;

	if (user) {					//only accessible for users
		res.render('science', {
			user: user
		})
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please log in to go to class."));
	}
});

app.get('/class/congrats' , (req, res) => {
	var user = req.session.user;

	if (user) {					//only accessible for users
		res.render('congrats', {
			user: user
		})
	} else {
		res.redirect('/login?message=' + encodeURIComponent("Please log in to go to class."));
	}
});


const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});