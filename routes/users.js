const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");
const { forwardAuthenticated } = require("../config/auth");

router.get("/register", forwardAuthenticated, (req, res) => res.render("login/register"));

router.get("/login", forwardAuthenticated, (req, res) => res.render("login/login"));

router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("login/register", {
      errors,
      name,
      email,
      password,
    });
  } else {
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("login/register", {
          errors,
          name,
          email,
          password,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;

        const savedUser = await newUser.save(); //nanti coba nd ush taru di variabel
        req.flash("success_msg", "You are now registered and can log in");
        res.redirect("/users/login");
      }
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout(() => { 
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
