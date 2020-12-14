const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Set Port
const port = 3000;

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
})

// Init app
const app = express();

// View engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function (req, res, next) {
    res.render('searchusers');
});

// Search Processing
app.post('/user/search', function (req, res, next) {
    let id = req.body.id;

    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User Page
app.get('/user/add', function (req, res, next) {
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function (req, res, next) {
    let id = req.body.id;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', firstname,
        'last_name', lastname,
        'email', email,
        'phone', phone
    ], function (err, reply) {
        if(err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

app.listen(port, function () {
    console.log('Server started on port '+ port);
});
