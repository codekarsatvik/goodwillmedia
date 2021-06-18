var timer ;
$("#searchBox").keydown((event)=>{
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();
    var searchType = textbox.data().search ;
    var timer = setTimeout(function(){
        
        value =  textbox.val().trim();
        // console.log(value);
        // console.log(searchType);
        if(value !== ""){
        search(value,searchType);
        }
    },1000)
    

})

function search( searchTerm , searchType) {
   
    var url = searchType == "users" ? "/api/users" : "/api/posts" ;
    

    $.get(url, {search : searchTerm}, (results)=>{
        if(searchType == "users"){
            outputUsers(results, $(".resultsContainer"));
            event.preventDefault();
        }else{
            outputPosts(results, $(".resultsContainer"));
            event.preventDefault();
        }
    })
}


function outputUsers(results, container) {
    container.html("");

    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function createUserHtml(userData, showFollowButton) {

    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton Following" : "followButton"

    var followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-id='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}