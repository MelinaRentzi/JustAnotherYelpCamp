var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var { isLoggedIn, checkUserCampground, checkUserComment, isAdmin, isSafe } = middleware; // destructuring assignment


// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// CLOUDINARY SETUP
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'melinayelpcamp',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//INDEX - show all campgrounds
router.get("/", function(req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB // Search campgrounds by name
        Campground.find({ name: regex }, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
            }
            else {
                if (allCampgrounds.length < 1) {
                    req.flash("error", "Campgrounds not found.");
                    return res.redirect("back");
                }
                res.render("campgrounds/index", { campgrounds: allCampgrounds });
            }
        });
    }
    else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("campgrounds/index", { campgrounds: allCampgrounds });
            }
        })
    }
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, upload.single('image'), function(req, res) {
    // var name = req.body.name;
    // var image = req.body.image;
    // var desc = req.body.description;
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // };
    // var cost = req.body.cost;
    // var location = req.body.location;
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add image's public_id to campground object
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
    });
});


//NEW - show form to create new campground
router.get("/new", isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err || !foundCampground) {
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        //render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
    });
});

// EDIT - shows edit form for a campground

router.get("/:id/edit", isLoggedIn, checkUserCampground, function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            console.log(err);
        }
        else {
            //render show template with that campground
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});

// PUT - updates campground in the database
router.put("/:id", checkUserCampground, isLoggedIn, function(req, res) {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        }
        else {
            //redirect somewhere(show page)
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


// DELETE - removes campground and its comments from the database

router.delete("/:id", isLoggedIn, checkUserCampground, function(req, res) {
    Comment.remove({
        _id: {
            $in: req.campground.comments
        }
    }, function(err) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/');
        }
        else {
            req.campground.remove(function(err) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('/');
                }
                req.flash('error', 'Campground deleted!');
                res.redirect('/campgrounds');
            });
        }
    })
});

module.exports = router;
