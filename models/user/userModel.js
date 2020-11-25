const connection = require('../../db.js');
const { response } = require('express');

const userModel = function(user) {
    this.username = user.username;
    this.email = user.email;
    this.country = user.country;
    this.password = user.password
};

// login function
userModel.login = function(username, password) {
    connection.query();
}

// register 
userModel.register = function(user, result) {
    connection.query('INSERT INTO users set = ?', user, function(err, respons) {
        if(err) throw err;

        result(null, response);
    });
}  

userModel.findOne = function(username, result) {
    connection.query('SELECT * FROM users WHERE username = ?', username, function(err, respons) {
        if(err) throw err;

        result(null, response);
    });
}

userModel.findOne = function(user_id, result) {
    connection.query('SELECT * FROM users WHERE user_id = ?', user_id, function(err, respons) {
        if(err) throw err;

        result(null, response);
    });
}

module.exports = userModel;