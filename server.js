require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const {
  validarAutenticado,
  validarNoAutenticado,
} = require("./middlewares/validaruser");

const app = express();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.get("/", validarAutenticado, (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/register", validarNoAutenticado, (req, res) => {
  res.render("register");
});

app.get("/login", validarNoAutenticado, (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  validarNoAutenticado,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", validarNoAutenticado, async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email });
  
  if (userFound) {
    req.flash("error", "Ya existe un Usuario con este correo");
    res.redirect("/register");
  }  else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        nombre: req.body.nombre,
        telefono: req.body.telefono,
        email: req.body.email,
        password: hashedPassword,
      });

      await user.save();
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("/register");
    }
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

mongoose
  .connect("mongodb://localhost:27017/login", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on Port 3000");
    });
  });
