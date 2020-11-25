module.exports = {
    isAuthenticated:function(req, res, next) {
        if(req.isAuthenticated()) {
            console.log
            return next();
        }

        req.flash('success_msg', 'login to access the page');
        res.redirect('/login');
    }
}
