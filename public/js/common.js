
var cropper;
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



$("#quoteTextarea").keyup(event => {
    var textbox = $(event.target);
    
    var value = textbox.val().trim();

    var submitButton = $("#quoteRetweetButton");

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
        }
        var html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val("");
        button.prop("disabled", true);
        
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

//  for getting post page
$(document).on("click", ".post", (event) => {
    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    if(postId === undefined) return;

    if(postId !== undefined && !element.is("button")){
        window.location.href = '/posts/' +  postId;
    }


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

//  for follwoing purpos
$(document).on("click", ".followButton", (event) => {
    var button = $(event.target);
    var userId = button.data().id ;
   
   
    

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: () => {

            window.location.reload();

        }
    })

})
$(document).on("click", "#submitDeleteButton", (event) => {
    var button = $(event.target);
    var postId = button.data().id ;
    console.log(postId);
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: () => {

           
            console.log("delted");
            location.reload();
           

        }
    })

})

$(document).on("click", "#quoteRetweetButton", (event) => {
    var button = $(event.target);
    var postId = button.data().id ;

    var textbox =  $("#quoteTextarea") ;
     
    
     var   content =  textbox.val();
    
    
    console.log(postId);
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/quoteretweet`,
        type: "POST",
        data : {data : content},
        success: () => {

           
            
            location.reload();

        }
    })

})
$("#deleteModal").on("show.bs.modal",(event)=>{
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitDeleteButton").data("id",postId);
    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $(".deletePostArea"));
    })
 
})
//  this is for comment button on this fun call we get the button and this get the post id from button 
$("#replyModal").on("show.bs.modal",(event)=>{
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id",postId);
    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $(".replyPost"));
    })
    console.log(postId);
})


//  for uplaoding profile picture
$("#profilePicture").change(function(){
    // var input = $(event.target);
 
    if(this.files && this.files[0]){
        var reader = new FileReader();
        reader.onload = (e) =>{
            $("#imagePreview").attr("src", e.target.result);
         const image = document.getElementById('imagePreview');
          cropper = new Cropper(image, {
         aspectRatio: 1 / 1,
        
});
        }
        reader.readAsDataURL(this.files[0]);

       
    }
    
})
//  cover photo 
$("#coverPicture").change(function(){
    // var input = $(event.target);
 
    if(this.files && this.files[0]){
        var reader = new FileReader();
        reader.onload = (e) =>{
            $("#coverPreview").attr("src", e.target.result);
         const image = document.getElementById('coverPreview');
          cropper = new Cropper(image, {
         aspectRatio: 16 / 9,
        
});
        }
        reader.readAsDataURL(this.files[0]);

       
    }
    
})


$(document).on("click","#submitProfilePictureButton",(event)=>{
    var canvas = cropper.getCroppedCanvas();

    if(canvas ==  null){
        alert("Please upload an image properly");
        return;
    }

    //  Blob is basically a binary large object used to store audio , video and images we will create our canvas to a blob and the npass is to server to store the

    canvas.toBlob((blob)=>{
        var formdata = new FormData();
        formdata.append("CroppedImage",blob);

        $.ajax({

            url : "/api/users/profilePicture",
            type : "POST",
            // processdata prevents from converting jquery to string
            processData : false, 
            //  to prevent header content ( boundry limit)
            data : formdata,
            contentType : false,
            success : function(){
                window.location.reload();
            }
        })
    })
})
//  cover photo

$(document).on("click","#deleteProfilePictureButton",(event)=>{
    

    

    //  Blob is basically a binary large object used to store audio , video and images we will create our canvas to a blob and the npass is to server to store the
    console.log("clicked profile");
        $.ajax({

            url : "/api/users/profilePicture",
            type : "DELETE",
            // processdata prevents from converting jquery to string
            success : function(){
                window.location.reload();
            }
        })
 })

$(document).on("click","#submitCoverPictureButton",(event)=>{
    var canvas = cropper.getCroppedCanvas();

    if(canvas ==  null){
        alert("Please upload an image properly");
        return;
    }

    //  Blob is basically a binary large object used to store audio , video and images we will create our canvas to a blob and the npass is to server to store the

    canvas.toBlob((blob)=>{
        var formdata = new FormData();
        formdata.append("CroppedCoverImage",blob);

        $.ajax({

            url : "/api/users/coverPicture",
            type : "POST",
            // processdata prevents from converting jquery to string
            processData : false, 
            //  to prevent header content ( boundry limit)
            data : formdata,
            contentType : false,
            success : function(){
                window.location.reload();
            }
        })
    })
})   


$("#deleteCoverPictureButton").click((event)=>{
    

    

    //  Blob is basically a binary large object used to store audio , video and images we will create our canvas to a blob and the npass is to server to store the

    console.log("clicked cover")
        $.ajax({

            url : "/api/users/coverPicture",
            type : "DELETE",
          
            // processdata prevents from converting jquery to string
            success : function(){
                window.location.reload();
            }
        })
})



$("#quoteRetweetModal").on("show.bs.modal",(event)=>{
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#quoteRetweetButton").data("id",postId);
    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $(".quoteRetweetPost"));
    })
    
})
$("#replyModal").on("hidden.bs.modal",(event)=>{
    $(".replyPost").html("");
    //  to remove content when close modal
})
function outputPosts(results, container) {
    container.html("");
  
    if(Array.isArray(results)){
    results.forEach((result) => {
      
        var html = createPostHtml(result);
        
        container.append(html);
    });
}else{
    var html = createPostHtml(results);
  
   
    container.append(html);
}

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}
function outputPostsWithReplies(results, container) {
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
    var replypost = createPostHtml(results.replyTo);
    container.append(replypost);
    }
    var post = createPostHtml(results.postData,true);
    container.append(post);
    results.replies.forEach(result => {
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

function createPostHtml(postData, largeFont = false) {

    var postedBy = postData.postedBy;
    
    // if(postedBy._id === undefined) {
    //     return console.log("User object not populated");
    // }
    // console.log(
    //     postData
    // );
    if(!postData._id){
        return "";
    }

    var isQuoteRetweet = (postData.content !== undefined && postData.retweetData !== undefined) ;
    var isRetweeted = postData.retweetData !== undefined ;
    var retweetText = '';
    if(isQuoteRetweet){
        var retweetContent = createPostHtml(postData.retweetData);
        postData.content = `<div>${postData.content}</div>
                            <div class="smallPost"> ${retweetContent}</div> 
                              ` 
    }else if(isRetweeted){

    
    //  retweet section 
    
    var retweetedBy = isRetweeted ? postData.postedBy.username : null ;
    
    postData = isRetweeted ? postData.retweetData : postData ;
    
    
    if(isRetweeted){
        // postData.retweets = [];
        // postData.likes = [];
        retweetText = `
        <i class='fas fa-retweet'></i>
        <span>Retweeted by <a href= '/profile/${retweetedBy}'>@${retweetedBy}</a></span>`
    }
}
 
    //  for replied post
    var replyFlag = "";
    if(postData && postData.replyTo && postData.replyTo._id){

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
    var largeFontClass = largeFont ? "large" : "";
    var likedPostClass  = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetedPostClass = postData.retweets.includes(userLoggedIn._id) ? "retweet" : "dropdown";
    var isOwnPost = postedBy._id == userLoggedIn._id ? "deletePost" : "" ;
    if(postData == null){
        return ;
    }
    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}' onerror="this.onerror=null; this.src='/images/profilePic.jpeg'">
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
                            <div class='postButtonContainer blue'>
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='dropdown postButtonContainer green'>
                                <button class= "${retweetedPostClass}" data-toggle="${retweetedPostClass}">
                                    <i class='fas fa-retweet'></i>
                                    
                                    <span>${postData.retweets.length || ""}</span>
                                </button>
                                
                                <ul class="dropdown-menu">
                                    <li><button class= "retweet" >Retweet</button></li>
                                    <li><button class= "quoteretweet" style=" color : green " data-toggle="modal" data-target="#quoteRetweetModal" >Quote Retweet</button></li>
                                    </ul>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likedPostClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div  >
                    
                    <button class= "${isOwnPost}" style= "display :none "  data-toggle="modal" data-target="#deleteModal">
                                    <i class='fa fa-trash'></i>
                                   
                                </button>
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
