const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.png')
    }
  })
   
  var upload = multer({ storage: storage })
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const path = require('path');
const fs = require('fs');
var coverfilepath ;
var profilefilepath ;
app.use(bodyParser.urlencoded({ extended: false }));

router.put("/:id/follow", async (req, res, next) => {

    var followUserId = req.params.id;
    var userId = req.session.user._id;
 
    var isFollowed = req.session.user.following && req.session.user.following.includes(followUserId);

    var option = isFollowed ? "$pull" : "$addToSet";
  

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { following:  followUserId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    
    // Insert post like
    User.findByIdAndUpdate(followUserId, { [option]: { followers:  userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send();
})



router.get("/:id/following", async (req, res, next) => {

    User.findById(req.params.id)
    .populate("following")
    .then((user) =>{
        res.status(200).send(user);
    })
    .catch(err =>{
        console.log(err);
    })
})

router.get("/:id/followers", async (req, res, next) => {

    User.findById(req.params.id)
    .populate("followers")
    .then((user) =>{
        res.status(200).send(user);
    })
    .catch(err =>{
        console.log(err);
    })
 
   

    
})

router.post("/profilePicture",upload.single("CroppedImage"),async (req, res, next)=>{
    
    if(!req.file){
        console.log("no image file attached to ajax call");
    }

    // var filepath =  `uploads/images/${req.file.filename}.png`;
    // var temPath = req.file.path;
    // var targetPath = path.join(__dirname , `../../${filepath}`);
    //  this is to store images in a correct folder
    profilefilepath = req.file.path.substr(6);
    User.findByIdAndUpdate(req.session.user._id, { profilePic : `${profilefilepath}` }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.sendStatus(200);



})

//  for the cover photo to
router.post("/coverPicture",upload.single("CroppedCoverImage"),async (req, res, next)=>{
    
    if(!req.file){
        console.log("no image file attached to ajax call");
    }

    // var filepath =  `uploads/images/${req.file.filename}.png`;
    // var temPath = req.file.path;
    // var targetPath = path.join(__dirname , `../../${filepath}`);
    //  this is to store images in a correct folder
    coverfilepath = req.file.path.substr(6);
    User.findByIdAndUpdate(req.session.user._id, { coverPic : `${coverfilepath}` }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.sendStatus(200);



})


//  deleted
router.delete("/coverPicture",async (req, res, next)=>{
    
  

    // var filepath =  `uploads/images/${req.file.filename}.png`;
    // var temPath = req.file.path;
    // var targetPath = path.join(__dirname , `../../${filepath}`);
    //  this is to store images in a correct folder
    if(coverfilepath == undefined){
        return ;
    }
    fs.unlink(`public${coverfilepath}`, function(err) {
        if (err) {
          throw err
        } else {
          console.log("Successfully deleted the file.")
        }
      })
    User.findByIdAndUpdate(req.session.user._id, { coverPic : "null" }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.sendStatus(200);



})
router.delete("/profilePicture",async (req, res, next)=>{
    
  

    // var filepath =  `uploads/images/${req.file.filename}.png`;
    // var temPath = req.file.path;
    // var targetPath = path.join(__dirname , `../../${filepath}`);
    //  this is to store images in a correct folder
    if(profilefilepath == undefined){
        return ;
       
    }
    fs.unlink(`public${profilefilepath}`, function(err) {
        if (err) {
          throw err
        } else {
          console.log("Successfully deleted the file.")
        }
      })
    User.findByIdAndUpdate(req.session.user._id, { profilePic : "/images/profilePic.jpeg" }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.sendStatus(200);



})
module.exports = router;