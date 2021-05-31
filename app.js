const express = require('express');
const bodyparser = require('body-parser');
// const mongoose = require('mongoose');
const app = express();
const mongoose = require("./database");
const middleware = require('./middleware')
const path = require('path');
const session = require("express-session");
// var _ = require('lodash');
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyparser.urlencoded({
  extended: false
}));
app.use(express.static("public"));
app.use(session({
  secret: "bbq chips",
  resave: true,
  saveUninitialized: false
}))
//  routes
const loginRoute = require('./routes/loginRoutes');
app.use('/login', loginRoute);



const registerRoute = require('./routes/registerRoutes');
app.use('/register', registerRoute);


const logoutRoute = require('./routes/logout');
app.use('/logout', logoutRoute);

// api post routes
const postsApiRoute = require('./routes/api/posts');
app.use('/api/posts', postsApiRoute);

const postRoute = require('./routes/viewPost');
app.use('/posts', middleware.requireLogin, postRoute);

const profileRoute = require('./routes/profilePage');
app.use('/profile', middleware.requireLogin, profileRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs : JSON.stringify(req.session.user)
  }
  res.status(200).render('home', {
    payload: payload
  });
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
