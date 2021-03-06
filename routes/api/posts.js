const express = require('express');
const app = express();
const router = express.Router();

const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

// Post.deleteMany({ __v: 0 }).then(function(){
//     console.log("Data deleted"); // Success
// }).catch(function(error){
//     console.log(error); // Failure
// });
router.get("/", async (req, res, next) => {

    var filter = req.query ;

    if(filter.isReply !== undefined){


        var isReply = filter.isReply == "true";
        filter.replyTo = { $exists : filter.isReply };
        delete filter.isReply ;
    }
    if(filter.search !== undefined){


        
        filter.content = { $regex : filter.search, $options : "i"  };
        console.log(filter.content);
        delete filter.search ;
    }

    if(filter.followingOnly !== undefined){
        var followingOnly = filter.followingOnly == "true";
        if(followingOnly){
            
        var objectId = req.session.user.following;
        objectId.push(req.session.user._id);
        filter.postedBy = { $in : objectId };
        }
        delete filter.followingOnly ;
    }
    var postData = await getPosts(filter);
    
    res.status(200).send(postData);
})

router.get("/:id", async (req, res, next) => {
    var postId = req.params.id;
    var postData = await getPosts({_id : postId});
    postData = postData[0];
    var results = {
        postData : postData 
    };
    
    if(postData.replyTo!== undefined){
        
        results.replyTo = postData.replyTo ;
    }
    results.replies = await getPosts({replyTo : postId});
    res.status(200).send(results);
    
    
})

router.post("/", async (req, res, next) => {

    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo ;
    }
   
    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: "postedBy" })

        res.status(201).send(newPost);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.put("/:id/like", async (req, res, next) => {

    var postId = req.params.id;
    var userId = req.session.user._id;

    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    var option = isLiked ? "$pull" : "$addToSet";

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send(post)
}) 


router.post("/:id/retweet", async (req, res, next) => {

    var postId = req.params.id;
    var userId = req.session.user._id;

    var isDeleted = await Post.findOneAndDelete({postedBy : userId , retweetData : postId})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = isDeleted != null ? "$pull" : "$addToSet";
   


    var repost = isDeleted;

    if(repost == null){
        repost = await Post.create({postedBy : userId , retweetData : postId})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })

    }
    
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets : repost._id } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweets: userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.status(200).send(post)
    
})

router.post("/:id/quoteretweet", async (req, res, next) => {

    var postId = req.params.id;
    var userId = req.session.user._id;
    var data = req.body.data ;
    
    
    var isDeleted = await Post.findOneAndDelete({postedBy : userId , retweetData : postId})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = isDeleted != null ? "$pull" : "$addToSet";
    

    var repost = isDeleted;

    if(repost == null){
        repost = await Post.create({postedBy : userId ,content : data , retweetData : postId})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })

    }
    
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets : repost._id } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweets: userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.status(200).send(post)
    
})
router.delete("/:id", async (req, res, next) => {

    var postId = req.params.id;
    // var userId = req.session.user._id;
    Post.findByIdAndDelete(postId)
    .catch(error => {
        console.log(error);
        
    })
    

    //  to delete replies to this post
    Post.deleteMany({ replyTo : postId }).then(function(){
    console.log("Replies  deleted"); // Success
}).catch(function(error){
    console.log(error); // Failure
});

//  for retweets
Post.deleteMany({ retweetData : postId }).then(function(){
    console.log("retweetData deleted"); // Success
}).catch(function(error){
    console.log(error); // Failure
});


    res.status(200).send()
    
})



async function getPosts(filter){
    var results = await Post.find(filter)
    .populate("postedBy")
    .sort({ "createdAt": -1 })
    .populate("retweetData")
    .populate("replyTo")
    .catch(error => {
        console.log(error);
        
    })
    results = await User.populate(results , {path : "replyTo.postedBy"});
    return await User.populate(results , {path : "retweetData.postedBy"});
    
}
module.exports = router;