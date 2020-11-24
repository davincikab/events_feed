const userModel = require("../../models/user/userModel");

exports.login = function(req, res) {
    console.log("Login Page");
    res.render("pages/login")
}

exports.register = function(req, res){
    res.render("pages/register")
}