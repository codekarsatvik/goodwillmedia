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
        pageTitle: "Profile Page",
        userLoggedIn: req.session.user,
        userLoggedInJs : JSON.stringify(req.session.user),
        postId : JSON.stringify(req.params.id)
      }

      res.status(200).render("profilePage",{payload : payload});
})



module.exports = router;