$("#postTextarea").keyup(event => {
    var textbox = $(event.target);
    
    var value = textbox.val().trim();

    var submitButton = $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})
$("#replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var submitButton = $("#submitReplyButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click((event) => {
    var button = $(event.target);
    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");
     
    var data = {
        content: textbox.val()
    }
    if(isModal) {
        var postId = button.data().id;
    
        data.replyTo = postId;
    }
    $.post("/api/posts", data, postData => {
        if(postData.replyTo){
            location.reload();
        }else{
        var html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val("");
        button.prop("disabled", true);
        }
    })
})

$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {

            button.find("span").text(postData.likes.length || "");
            
            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
            }else{
                button.removeClass("active");
            }

        }
    })

})

//  for retweet we follow mostly same as like

$(document).on("click", ".retweet", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {

           
            button.find("span").text(postData.retweets.length || "");
            location.reload();
            if(postData.retweets.includes(userLoggedIn._id)){
                button.addClass("active");
            }else{
                button.removeClass("active");
            }

        }
    })

})

//  this is for comment button on this fun call we get the button and this get the post id from button 
$("#replyModal").on("show.bs.modal",(event)=>{
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id",postId);
    $.get("/api/posts/" + postId, results => {
        outputPosts(results, $(".replyPost"));
    })
    console.log(postId);
})
$("#replyModal").on("hidden.bs.modal",(event)=>{
    $(".replyPost").html("");
    //  to remove content when close modal
})
function outputPosts(results, container) {
    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}
function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData) {

    var postedBy = postData.postedBy;

    // if(postedBy._id === undefined) {
    //     return console.log("User object not populated");
    // }
   


    //  retweet section 
    var isRetweeted = postData.retweetData !== undefined ;
    var retweetedBy = isRetweeted ? postData.postedBy.username : null ;

    postData = isRetweeted ? postData.retweetData : postData ;
    var retweetText = '';
    if(isRetweeted){
        // postData.retweets = [];
        // postData.likes = [];
        retweetText = `
        <i class='fas fa-retweet'></i>
        <span>Retweeted by <a href= '/profile/${retweetedBy}'>@${retweetedBy}</a></span>`
    }
    

    //  for replied post
    var replyFlag = "";
    if(postData.replyTo){

        if(!postData.replyTo._id){
            console.log("populate replyto");
        }else if(!postData.replyTo.postedBy._id){
            console.log("poplate postedby");
        }else{
            var repliedby = postData.replyTo.postedBy.username ;
            replyFlag = `<div class="replyFlag">
             Replying to <a href='/profile/${repliedby}'>@${repliedby}</a>
            </div>`
        }
    }
    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likedPostClass  = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetedPostClass = postData.retweets.includes(userLoggedIn._id) ? "active" : "";
    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class= "retweet ${retweetedPostClass}">
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweets.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likedPostClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";

        return Math.round(elapsed/1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';
    }
}
