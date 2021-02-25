const express = require("express");

const user = require("../../controller/user/userController");
const { isAuthenticated } = require("../../config/auth");
const { allowOnly, accessLevels  } = require("../../config/roles");

const userRouter = express.Router();

userRouter.get("/register", user.register);
userRouter.get("/login", user.login);
userRouter.get("/logout", function(req, res) {
    req.logout();
    // req.flash('success_msg','Now logged out');
    res.redirect("/login");
});

userRouter.get("/user_profile/:username/", isAuthenticated, user.userEvents);

userRouter.post("/login", user.post_login);

userRouter.post("/register", user.post_register);
userRouter.get("/accounts", isAuthenticated, allowOnly(accessLevels.admin, user.getAllUsers));
userRouter.post("/lock_account/:username/", isAuthenticated, allowOnly(accessLevels.admin, user.lockAccount))
userRouter.post("/unlock_account/:username/", isAuthenticated, allowOnly(accessLevels.admin, user.unlockAccount))


// report user account
userRouter.get("/reported-accounts/", isAuthenticated, allowOnly(accessLevels.admin, user.getReportedAccounts));
userRouter.post("/report-account/:username/:reported_by/", isAuthenticated, allowOnly(accessLevels.admin, user.reportAccount));
userRouter.post("/reported-account/remove/:report_id/",isAuthenticated, allowOnly(accessLevels.admin, user.deleteReport));
userRouter.get("/reported-accounts/:report_id/", isAuthenticated, allowOnly(accessLevels.admin, user.getReportedAccount));

module.exports = userRouter;