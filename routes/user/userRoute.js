const express = require("express");
const user = require("../../controller/user/userController");

const userRouter = express.Router();

userRouter.get("/register", user.register);
userRouter.get("/login", user.login);

module.exports = userRouter;