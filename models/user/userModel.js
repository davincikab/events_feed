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
userModel.createUser = function(user, result) {
    connection.query('INSERT INTO users SET?', user, function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}  

userModel.findOne = function(username, email, result) {
    connection.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], function(err, response) {
        if(err) throw err;

        console.log(response);
        result(null, response);
    });
}

userModel.findUserByUsername = function(username, result) {
    connection.query('SELECT username, email, country, account_type, is_locked, is_admin FROM users WHERE username = ?', [username], function(err, response) {
        if(err) throw err;

        console.log(response);
        result(null, response);
    });
}

userModel.findById = function(user_id, result) {
    connection.query('SELECT * FROM users WHERE user_id = ?', user_id, function(err, response) {
        if(err) throw err;

        result(null, response[0]);
    });
}

userModel.getAllUsers = function(result) {
    connection.query('SELECT * FROM users', function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}

userModel.getReportedAccounts = function(result) {
    connection.query('SELECT * FROM reported_accounts', function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}

userModel.deleteReportById = function(report_id, result) {
    connection.query('DELETE FROM reported_accounts WHERE report_id =? ',report_id , function(err, response) {
        if(err) throw err;

        result(null, response[0]);
    });
}

userModel.reportAccount = function(report, result) {
    connection.query('INSERT INTO reported_accounts SET? ', report, function(err, response) {
        if(err) throw err;

        result(null, response[0]);
    });
}

userModel.getReportedAccounts = function(result) {
    connection.query('SELECT * FROM reported_accounts', function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}

userModel.lockUserAccount = function(username, result) {
    connection.query('UPDATE users SET is_locked=? WHERE username=? ',[true, username] , function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}

userModel.unlockUserAccount = function(username, result) {
    connection.query('UPDATE users SET is_locked=? WHERE username=? ',[false, username] , function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}

userModel.getLockedAccounts = function(result) {
    connection.query('SELECT * FROM users WHERE is_locked=?', true, function(err, response) {
        if(err) throw err;

        result(null, response);
    });
}



// report an account
module.exports = userModel;