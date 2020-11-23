const connection = require('../../db.js');

const userModel = function(user) {
    this.user_id = user.user_id;
    this.user_name = user.user_name;
    this.country = user.country;
    this.password = user.password
};

// login function
userModel.login = function(username, password) {

}

// register 
userModel.register = function(user) {

}

module.exports = userModel;