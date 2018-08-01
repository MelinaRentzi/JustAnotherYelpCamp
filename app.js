var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

var campgrounds = [
    { name: "Salo", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" },
    { name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" },
    { name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" },
    { name: "Mounts", image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Camp_4.jpg" }
]

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/campgrounds", function(req, res) {
    res.render("campgrounds", { campgrounds: campgrounds });
});

app.get("/campgrounds/new", function(req, res) {
    res.render("new.ejs");
});

app.post("/campgrounds", function(req, res) {
    // get data from form and add them to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = { name: name, image: image };
    campgrounds.push(newCampground);
    //redirect back to campgrounds page (default = redirect as a get request)
    res.redirect("/campgrounds");
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The YelpCamp Server has started!");
});
