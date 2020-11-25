const userModel = require("../../models/user/userModel");
const router = require("../../routes/events/eventsRoute");
const passport  = require('passport');
const { render } = require("ejs");
const { response } = require("express");

exports.login = function(req, res) {
    res.render("pages/login");
}

exports.register = function(req, res){
    res.render("pages/register");
}

// post request
exports.post_register = function(req, res, next) {
    const { username, email, email2, country, password, password2 } = req.body;
    let errors = [];

    if(!username || !email || !country || !password || !password2) {
        errors.push({msg : "Please fill in all fields"})
    }

    if(email != email2) {
        errors.push({msg:'Emails do not match'});
    }

    if(password != password2) {
        errors.push({msg:'Passwords do not match'});
    }

    // check password length
    if(password.length < 8) {
        errors.push({msg:'Password should have 8 character or more'});
    }

    // check if we have a user the given username
    if(errors.length > 0) {
        res.render('pages/register', {
            errors:errors,
            username:username,
            email:email,
            email2:email2,
            country:country,
            password:password,
            password2:password2
        });
    } else {
        userModel.findOne(username, function(err, user) {
            if(user) {
                errors.push({msg: 'username already registered'});
                res.render('pages/register', {
                    errors:errors,
                    username:username,
                    email:email,
                    email2:email2,
                    country:country,
                    password:password,
                    password2:password2
                });
            } else {
                let user = new userModel({
                    username:username,
                    email:email,
                    country:country,
                    password:password,
                });

                // encrypt password

            }

            
        });
    }
    
}

exports.post_login = function(req, res, next) {
    passport.authenticate('local', {
        successRedirect:'/map',
        failureRedirect:'/login',
        failureFlash:true
    }); 
    
}