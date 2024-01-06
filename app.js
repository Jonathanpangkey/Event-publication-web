const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const multer = require("multer");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
require("dotenv").config();

const app = express();

require("./config/passport")(passport);

// database connection
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectToDB();

// file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // Set the destination folder to /tmp for uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const filename = `image_${uniqueSuffix}${fileExtension}`; // Set a unique filename for the uploaded image
    cb(null, filename);
  },
});


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

module.exports = {
  upload: upload,
};

// middleware
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  user = req.user;
  next();
});
app.use(express.static("public"));

// routes
app.get("/", (req, res) => {
  res.render("welcome");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.use("/users", require("./routes/users.js"));
app.use("/events", require("./routes/events.js"));
app.use("/events", require("./routes/docs.js"));

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
