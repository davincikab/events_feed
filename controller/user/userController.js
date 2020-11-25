const userModel = require("../../models/user/userModel");
const bcrypt = require('bcrypt');
const passport  = require('passport');

exports.login = function(req, res) {
    res.render("pages/login");
}

exports.register = function(req, res){
    res.render("pages/register", {
        username:'',
        email:'',
        email2:'',
        country:'',
        password:'',
        password2:''
    });
}

// post request
exports.post_register = function(req, res, next) {
    const { username, email, email2, country, password, password2 } = req.body;
    let errors = [];

    // Validate the input fields
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
        // check id user with the submited name or email exists in the database
        userModel.findOne(username, email, function(err, response) {
            if(err) throw err;

            if(response[0]) {
                let users = [...response];
                users.forEach(user => {
                    if(user.username == username) {
                        errors.push({msg: 'username already registered'});
                    } 

                    if(user.email == email) {
                        errors.push({msg: 'email already registered'});   
                    }
                });        
                
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
                // user instance
                let user = new userModel({
                    username:username,
                    email:email,
                    country:country,
                    password:password,
                });

                // encrypt password
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, encrypted_password) {
                        if(err) throw err;

                        // update with the encrypted data
                        user.password = encrypted_password;

                        // add the data to the database
                        userModel.createUser(user, function(err, response) {
                            if(err) throw err;

                            // flash message
                            req.flash('success_msg','You have now registered!')

                            // redirect the user to login page
                            res.redirect("/login");
                        })

                    })
                });
            }

            
        });
    }
    
}

exports.post_login = function(req, res, next) {
    // authenticate user using passport local strategy
    passport.authenticate('local',{
        successRedirect : '/map',
        failureRedirect : '/login',
        failureFlash : true,
    })(req,res,next);
}
    
    
