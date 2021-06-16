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
        profileUser : req.session.user
      }

      res.status(200).render("profilePage",{payload : payload});
})

router.get("/:username", async (req, res, next) => {
    var payload = await getpayload(req.params.username , req.session.user);
  
    payload.selectedTab = "posts";
     res.status(200).render("profilePage",{payload : payload});
})

router.get("/:username/replies", async (req, res, next) => {
    var payload = await getpayload(req.params.username , req.session.user);
    
    payload.selectedTab = "replies";
  
     res.status(200).render("profilePage",{payload : payload});
})

router.get("/:username/following", async (req, res, next) => {
    var payload = await getpayload(req.params.username , req.session.user);
    payload.pageTitle = req.params.username ;
    payload.selectedTab = "following";
  
     res.status(200).render("followersandfollowing",{payload : payload});
})

router.get("/:username/followers", async (req, res, next) => {
    var payload = await getpayload(req.params.username , req.session.user);
    payload.selectedTab = "followers";
    payload.pageTitle = req.params.username;
    res.status(200).render("followersandfollowing",{payload : payload});
})



async function getpayload(username,userLoggedIn){

    var user = await User.findOne({username: username});
 
    if(user == null){
        
        user = await User.findById( username);
        if(user == null){
            return{
            pageTitle: "User Not Found",
            userLoggedIn: userLoggedIn,
            userLoggedInJs : JSON.stringify(userLoggedIn),
            }
        }
    
    return {
        pageTitle: "Profile Page",
        userLoggedIn: userLoggedIn,
        userLoggedInJs : JSON.stringify(userLoggedIn),
        profileUser : user
     }
    }

    return {
       pageTitle: "Profile Page",
       userLoggedIn: userLoggedIn,
       userLoggedInJs : JSON.stringify(userLoggedIn),
       profileUser : user
    }
}

module.exports = router;