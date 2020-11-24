const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fileUpload = require('express-fileupload');

// router
const userRouter = require("./routes/user/userRoute");
const router = require("./routes/events/eventsRoute");

// config doteve module
require('dotenv').config();

// express app instance
const app = express();

// add file upload middleware
app.use(fileUpload());

// templating engine
app.set('view engine', 'ejs');

// stati files 
app.use("/static/", express.static(path.join(__dirname, '/views')));
app.use("/uploads/", express.static(path.join(__dirname, '/uploads')));

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
app.use('', userRouter);
app.use('', router);

app.get("/", (req, res, next) => {
    res.render("pages/index");
});

app.get("/map", (req, res, next) => {
    res.render("pages/map")
});

// listen on a given port
app.listen(process.env.PORT, function() {
    console.log("App listening at port " + process.env.PORT);
});