const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Discussion Channel",
        userLoggedIn: req.session.user,
        profileUser : req.session.user,
        userLoggedInJs : JSON.stringify(req.session.user),
      
      }
      res.status(200).render("discussion",{payload : payload});

})



module.exports = router;