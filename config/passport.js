const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const userModel = require("../models/user/userModel");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({userNameField:'email'}, (email, password, done) => {
            userModel.findOne('', email, function(err, users) {

                if(!users[0]) {
                    return done(null,false,{message : 'that email is not registered'});
                }

                let user = users[0];

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
            return done(err, user[0]);
        });
    });
}