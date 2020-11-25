const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const userModel = require("../models/user/userModel");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({userNameField:'username'}, (username, password, done) => {
            userModel.findOne(username, function(err, user) {

                if(!user) {
                    return done(null,false,{message : 'that email is not registered'});
                }

                // match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;

                    if(isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, {message: 'Incorrect password'});
                    }

                })
            })

        })
    )

    passport.serializeUser(function(user, done) {
        return done(null, user.user_id);
    });

    passport.deserializeUser(function(user_id, none) {
        userModel.findById(user_id, function(err, user) {
            return done(err, user);
        });
    });
}