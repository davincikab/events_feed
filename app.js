const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { read } = require('fs');

const app = express();

// templating engine
app.set('view engine', 'ejs');

// stati files 
app.use("/static/", express.static(path.join(__dirname, '/views')));

// http request body parser
app.use(bodyParser.json());

// consfigure session
app.use(session({
    secret:'azsADD1hdjdunGLhdjd',
    resave:true,
    saveUninitialized:false,
    cookie:{ path: '/', httpOnly: true, secure: false, maxAge: null },
}));


// configure the routes
app.get("/", (req, res, next) => {
    res.render("pages/index");
});

app.get("/login", (req, res, next) => {
    res.render("pages/login")
});
app.get("/register", (req, res, next) => {
    res.render("pages/register")
});

app.get("/map", (req, res, next) => {
    res.render("pages/map")
});

// listen on a given port
app.listen(3000, function() {
    console.log("App listening at port 3000");
});