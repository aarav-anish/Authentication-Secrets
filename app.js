require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Successfully connected to db");
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
})

/////////////////// Register ///////////////////////

app.route("/register")

.get(function(req, res) {
    res.render("register");
})

.post(function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(err)
            console.log(err);
        else {
            const user = new User({
                email: req.body.username,
                password: hash
            })
            user.save(function(err) {
                if(err)
                    console.log(err);
                else
                    res.render("secrets");
            });
        }
    });
});

///////////////////// Login //////////////////////////

app.route("/login")

.get(function(req, res) {
    res.render("login");
})

.post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function(err, foundUser) {
        if(err)
            console.log((err));
        else {
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if(result == true)
                        res.render("secrets");
                    else
                        res.status(404).send("<h2> Invalid user credentials. Enter the correct password </h2>");
                });
            }
            else
                res.status(404).send("<h2> User does not exist. Kindly register to know the secrets </h2>");
        }
    })
});

////////////////////// Logout //////////////////////////

app.get("/logout", function(req, res) {
    res.redirect("/");
});

////////////////////// Submit //////////////////////////

app.route("/submit")

.get(function(req, res) {
    res.render("submit");
})





let port = process.env.PORT;
if(port==null || port=="") {
    port = 3000;
}
app.listen(port, function(req, res) {
    console.log("Server started running on " + port);
});