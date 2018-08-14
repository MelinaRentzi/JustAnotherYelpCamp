var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req, res) {
    res.render("landing");
});


// =====================//
// AUTHORIZATION ROUTES //
// =====================//

// show register form
router.get("/register", function(req, res) {
    res.render("register");
});
// handle signup logic
router.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/campgrounds");
        });
    });
});

// show login form
router.get("/login", function(req, res) {
    res.render("login");
});

// handle login logic
// middleware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"

}), function(req, res) {

});

// handle logout logic
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged out successfully.");
    res.redirect("/campgrounds");
});


module.exports = router;
