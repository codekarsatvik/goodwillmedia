const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({
  extended: false
}));

router.get("/", (req, res, next) => {
  var payload = req.body;
  res.status(200).render("login", {
    payload: payload
  });
})

router.post("/", async (req, res, next) => {

  var payload = req.body;

  if (req.body.username && req.body.password) {
    var user = await User.findOne({
        $or: [{
            username: req.body.username
          },
          {
            email: req.body.username
          }
        ]
      })
      .catch((error) => {
        console.log(error);
        payload.errorMessage = "Something went wrong.";
        res.status(200).render("login", {
          payload: payload
        });
      });

    if (user != null) {
      var result = await bcrypt.compare(req.body.password, user.password);

      if (result === true) {
        req.session.user = user;
        return res.redirect("/");
      }
    }

    payload.errorMessage = "Login credentials incorrect.";
    return res.status(200).render("login", {
      payload: payload
    });
  }

  payload.errorMessage = "Make sure each field has a valid value.";
  res.status(200).render("login", {
    payload: payload
  });
})

module.exports = router;
