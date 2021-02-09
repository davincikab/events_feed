module.exports = {
    accounts:function(req, res, next) {
        if(req.isAuthenticated() && req.user.is_admin) {
            // console.log("Authenticated");
            // get users
            // get pending events
            // get pending contribution
            // get notification
            return next();
        } 
    }
}
