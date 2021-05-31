const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/:id", (req, res, next) => {
  
    var payload = {
        pageTitle: "View Post",
        userLoggedIn: req.session.user,
        userLoggedInJs : JSON.stringify(req.session.user),
        postId : JSON.stringify(req.params.id)
      }

      res.status(200).render("viewPost",{payload : payload});

})



module.exports = router;
