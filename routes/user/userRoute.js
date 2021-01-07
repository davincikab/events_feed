const express = require("express");

const user = require("../../controller/user/userController");
const { isAuthenticated } = require("../../config/auth");

const userRouter = express.Router();

userRouter.get("/register", user.register);
userRouter.get("/login", user.login);
userRouter.get("/logout", function(req, res) {
    req.logout();
    // req.flash('success_msg','Now logged out');
    res.redirect("/login")
});

userRouter.get("/user_profile/:username/", isAuthenticated, user.userEvents);

userRouter.post("/login", user.post_login);

userRouter.post("/register", user.post_register);

module.exports = userRouter;