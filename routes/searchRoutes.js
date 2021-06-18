const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));



router.get("/:selectedtab", async (req, res, next) => {
    var payload = await getpayload(req.session.user);
  
    payload.selectedTab = req.params.selectedtab;
     res.status(200).render("searchPage",{payload : payload});
})




async function getpayload(userLoggedIn){

  

    return {
       pageTitle: "Search Page",
       userLoggedIn: userLoggedIn,
       userLoggedInJs : JSON.stringify(userLoggedIn),
       profileUser : userLoggedIn
    }
}

module.exports = router;