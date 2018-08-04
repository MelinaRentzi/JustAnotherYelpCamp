var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Schema setup

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create({ name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg", description: "This is a huge tent" }, function(err, campground) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log("NEWLY CREATED CAMPGROUND: ");
//         console.log(campground);
//     }
// });

// var campgrounds = [
//     { name: "Salo", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" },
//     { name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" },
//     { name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" },
//     { name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" }
// ]

app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX - Show all campgrounds
app.get("/campgrounds", function(req, res) {
    // get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { campgrounds: allCampgrounds });
        }
    });
});

// NEW - Show form to create new campground
app.get("/campgrounds/new", function(req, res) {
    res.render("new.ejs");
});

//CREATE - Add new campground to DB
app.post("/campgrounds", function(req, res) {
    // get data from form and add them to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = { name: name, image: image, description: desc };
    //Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            //redirect back to campgrounds page (default = redirect as a get request)
            res.redirect("/campgrounds");
        }
    });

});

// SHOW - Shows more info about 1 campground
app.get("/campgrounds/:id", function(req, res) {
    // find the campground with provided ID
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            console.log(err);
        }
        else {
            // render show template with that campground
            res.render("show", { campground: foundCampground });
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The YelpCamp Server has started!");
});
