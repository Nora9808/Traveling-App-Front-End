/**
 * This file contains the functionality for the place details page.
 * It manages all the place details page and evet handlers.
*/
$(document).ready(function(e){
    //set the loaded page type
    localStorage.setItem("page", "place");
    //get the token, user id, and role from local storage
    let token = localStorage.getItem('token');
    let user_id = localStorage.getItem("userId");
    let user_role = localStorage.getItem("userRole");
    //get place id name and description from local storage
    let place_id = localStorage.getItem("searchPlaceId");
    let place_name = localStorage.getItem("searchPlaceName");
    let placeDescription = localStorage.getItem("searchPlaceDescription");
    //get the required place type from local storage 
    let search_type = localStorage.getItem("searchType");
    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json});

    // if the user is admin, hide the new review form 
    if(user_role == "Admin"){
        $('.nav-profile').addClass('profile');
        $("#new-review-form").hide();
    }
    
    //check the type of the place required to display in the page
    let plcae_elements = "";
    if(search_type == "continent"){
        plcae_elements = "<div class='col'><img src='../img/app-imgs/continents/"+place_id+".jpg' class='img-fluid' id='main-img-9' alt='Responsive image'></div>"
    }
    else if(search_type == "country"){
        plcae_elements = "<div class='col'><img src='../img/app-imgs/countries/"+place_id+".jpg' class='img-fluid' id='main-img-9' alt='Responsive image'></div>"
    }
    else{
        plcae_elements = "<div class='col'><img src='../img/app-imgs/cities/"+place_id+".jpg' class='img-fluid' id='main-img-9' alt='Responsive image'></div>"
    }
    
    //add place name, description and buttons element to the page
    plcae_elements += "<div class='col'><h1 class=' mt-5 display-4' id='place-title'>" +place_name+ "<br><h3>" + placeDescription +"</h3></h1></div>";
    if(user_role === 'User'){
        plcae_elements += "<br><button type='button' class='btn add-to-favorites-btn'>Add to Favorites</button>";
        plcae_elements += "<br><button type='button' class='btn add-to-collection-btn'>Add to Collections</button>";
    }
    plcae_elements += "<p id='favorites-message'></P>";
    
    //add the html elements to the div container in the page
    $("#place-profile").html(plcae_elements);

    // display table pagination
    let pageNum = 1;
    $("#page-num").text(pageNum);

    // previouse page click
    $("#prev-link").on('click', function(){
        pageNum = $("#page-num").val();
        if(pageNum > 1){
            pageNum--;
        }
        else{
            pageNum = 1;
        }
        getUserDetails(token, user_role, user_id, api, place_id, pageNum);
        $("#page-num").text(pageNum);
    });

    // next page click 
    $("#next-link").on('click', function(){
        pageNum ++;
        getUserDetails(token, user_role, user_id, api, place_id, pageNum);
        $("#page-num").text(pageNum);
    });

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        //a function to get all the user details and their reviews in the place table
        getUserDetails(token, user_role, user_id, api, place_id, pageNum);
    }, 100);


    //add new review button click handler
    $("#add-new-review").on('click', function(e){
        e.preventDefault();
        // get the rating and reviews value
        let selected_rating = $("#rating-option option:selected").text();
        let new_review = $("#new-review-textarea").val();

        if(new_review !== ''){
            //POST call to create a new review for the loaded place
            $.ajax({
                url: api.post_new_review,
                method: 'POST',
                mode: 'cors',
                data: JSON.stringify({"placeId": parseInt(place_id), "userId": parseInt(user_id), "placeName": place_name, 
                "reviews1": new_review, "rating": parseFloat(selected_rating)}),
                contentType: 'application/json',
                success: function(result) {
                    $("p#error-message").text("");
                    //reload the page
                    location.reload();
                },
                // handle errors
                error: function() {
                $("p#error-message").text("Something went wrong while adding review!")
                }
            });
        }
        else{
            $("p#error-message").text("Empty review and/or rating, please check before adding!");
        }
    });

    //add to favorite click handler 
    $(document).on("click", ".add-to-favorites-btn", function (e) {
        //POST call to add this place to user's faorites place
        $.ajax({
            url: api.post_to_favorites,
            method: 'POST',
            mode: 'cors',
            data: JSON.stringify({"placeId": parseInt(place_id), "userId": parseInt(user_id), "Name": place_name}),
            contentType: 'application/json',
            success: function(result) {
                //display success message
                $("#favorites-message").text(place_name + " successfully added to favorites.")
            },
            // handle errors
            error: function(request,msg,error) {
            }
        });
    });

    //add to collection button click handler
    $(document).on("click", ".add-to-collection-btn", function (e) {
        e.stopImmediatePropagation();
        //GET call to get all the user's collection
        $.ajax({
          url: api.get_all_user_collections + user_id,
          method: 'GET',
          mode: 'cors',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + token },
          success: function (result) {
            //group the colections by name
            let filter_values = result.map(item => item.name)
            .filter((value, index, self) => self.indexOf(value) === index);
           console.log(filter_values);
            //add the collection name to dropdown
           for(index in filter_values){
                var o = new Option(filter_values[index], filter_values[index]);
                $("#collection-dropdown").append(o);
           }
           //display place name in the pop up
           $("#coll-place").text(place_name);
           $("#pop-up").fadeIn();
          },
          error: function (request, msg, error) {
          }
        });
    
    });

    //cancel button to hide add to collection pop up
    $("#popup-cancel-btn").on('click', function(){
        $("#pop-up").fadeOut();
    });


    //add to collection button click handler in the pop up 
    $(document).on("click", "#popup-add-btn", function (e) {
        e.stopImmediatePropagation();
        //get the selected collection name
        let selected_coll = $("#collection-dropdown option:selected").text();
        
        //POST call to add the place to the collections table
        $.ajax({
            url: api.post_to_collection,
            method: 'POST',
            mode: 'cors',
            data: JSON.stringify({"userId": parseInt(user_id),"name": selected_coll,
                                 "placeId": parseInt(place_id),"placeName": place_name}),
            contentType: 'application/json',
            success: function(result) {
              //reload the page
              location.reload();   
            },
            // handle errors
            error: function(request,msg,error) {
                //dispay error message
                $("#error-message").text("something went wrong while adding to collection!")
            }
        });
    });

    //admin delete review click handler
    $(document).on("click", ".admin-delete-button", function (e) {
        //get review id and place name
        let review_id = $(this).val().split("-")[0];
        let name = $(this).val().split("-")[1];

        //confirm the admin wants to delete the review 
        $.confirm({
            title: 'Delete!',
            content: 'Are you sure want to delete '+ name + '\'s review?',
            buttons: {
                confirm: function () {
                    //DELETE call to delete the place review
                    $.ajax({
                        url: api.delete_review_by_reviewid + review_id,
                        method: 'DELETE',
                        mode: 'cors',
                        contentType: 'application/json',
                        headers: { Authorization: 'Bearer ' + token },
                        success: function (result) {
                            //reload the page
                            location.reload();
                        },
                        error: function (request, msg, error) {
                        }
                    });
                },
                cancel: function () {
                    $.alert('Canceled!');
                }
            }
        });
    });


    /**
     * set timeout to 100 milisecond to make sure the html elements
     * before any follow/unfollow click event
    */
    setTimeout(function(){
        //user name click handler
        $(document).on("click", ".review-user-name", function (e) {
            e.stopImmediatePropagation();
            //get the user name and id and set them in local storage
            let followingName = e.currentTarget.innerText;
            let followingId = e.target.attributes.value.value;
            localStorage.setItem("followingId", followingId);
            localStorage.setItem("followingName", followingName);

            //check if the logged user is following the clicked username
            //set the follow type in loacl storage
            if(!followings.includes(parseInt(followingId))){
                localStorage.setItem("followingType", "unfollow");
            }
            else{
                localStorage.setItem("followingType", "follow");
            }
            //redirect to following profile
            window.location.href="../html/followingProfile.html";
        });

        //user follow button handler in place page
        $(document).on("click", ".place-follow-button", function (e) {
            //get user id
            let followingId = $(this).val().split("-")[0];
            //POST call to follow the user
            $.ajax({
                url: api.post_follow_user,
                method: 'POST',
                mode: 'cors',
                data: JSON.stringify({
                    "followingId": parseInt(followingId),
                    "userId": parseInt(user_id)
                }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function (result) {
                  //reload the page
                  location.reload();
                },
                error: function (request, msg, error) {
                    //display error message
                  $("#acc-sett-msg").text("Something went wrong while creating the event!");
                }
            });
        });

        //unfollow button handler in place page
        $(document).on("click", ".place-unfollow-button", function (e) {
            //get user name and id
            let followingId = $(this).val().split("-")[0];
            let followingName =  $(this).val().split("-")[1];
            //confirm if the user wants to unfollow the other user
            $.confirm({
                title: 'Delete!',
                content: 'Are you sure want to unfollow '+ followingName + '?',
                buttons: {
                    confirm: function () {
                        //DELETE call to unfollow the user
                        $.ajax({
                            url: api.delete_unfollow_by_userid_followingid +user_id+'&followingId='+followingId,
                            method: 'DELETE',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function (result) {
                                //reload the page
                                location.reload();
                            },
                            error: function (request, msg, error) {
                            }
                        });
                    },
                    cancel: function () {
                        $.alert('Canceled!');
                    }
                }   
            });
        });

    }, 100);
});


/**
 * a function to laod the reviews with the usernames and follow/unfollow button
 * @param {*} data : reviews data
 * @param {*} token : api token
 * @param {*} user_role : logged user role
 * @param {*} user_id : logged user id
 * @param {*} followings : logged user following list
 * @param {*} api : api list
 */
function getUserDetails(token, user_role, user_id, api, place_id, pageNum){
    
    //array to store the logged user following
    var followings = [];
    var all_reviews = [];
    //GET call to get the logged user followings
    $.ajax({
        url: api.get_all_followings_by_userid + user_id,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            //add the result to following array
            for(let x = 0; x < result.length; x++){
                followings.push(result[x]["userId"])
            }
        },
        error: function (request, msg, error) {
        }
    });  


    //GET call to get all the reviews related to the loaded place
    $.ajax({
        url: api.get_reviews_by_placeid + place_id + "?pageNum=" + pageNum,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {

            //display the reviews in a table
            if(result.length === 0){
                pageNum --;
                if(pageNum > 1){
                    getUserDetails(token, user_role, user_id, api, pageNum-1);
                    $("#page-num").text(pageNum-1);
                }
            }
            else{
                all_reviews = result;
            }
        },
        error: function (request, msg, error) {
        }
    });

    
    /**
     * set timeout to 100 milisecond to make sure the ajax data
     * is completly retrieved before display it in html elements
    */
    setTimeout(function(){
       
        //loop through the review data
        for (let i = 0; i < all_reviews.length; i++) {
            // GET call to get the name of each user that have a review 
            $.ajax({
                url: api.get_user_by_userid + all_reviews[i]['userId'],
                method: 'GET',
                mode: 'cors',
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function (result) {
                    // ad the usernames, reviews and the follow/unfollow buttons to the table
                    var tableBody = $("#place-reviews-tbody");
                    var iTABLE = "";
                    iTABLE += "<tr> ";
                    iTABLE += "<td class='row-id'>" + (i+1) + "</td>";

                    //check if the user is the logged user
                    if(user_role == "User" && all_reviews[i]['userId'] === parseInt(user_id)){
                        //add unclickable username
                        iTABLE += "<td class ='user-name-cell'>" + result["firstName"] + " " + result["lastName"]+ "</td>";
                    }
                    else{
                        //add clickable username
                        iTABLE += "<td class ='user-name-cell'><a href='#' class='review-user-name' value='"+result["userId"]+"'>" + result["firstName"] + " " + result["lastName"]+ "</a></td>";
                    }

                    iTABLE += "<td>" + all_reviews[i]['reviews1'] + "</td>";
                    iTABLE += "<td>" + parseFloat(all_reviews[i]['rating']) + "</td>";

                    //check if the user is not following the other user
                    if(user_role == "User" && all_reviews[i]['userId'] !== parseInt(user_id) && !followings.includes(all_reviews[i]['userId'])){
                        //add follow button
                        iTABLE += "<td id='reviews-buttons'>" + 
                        "<button type='button' class='btn place-follow-button' value='"+all_reviews[i]['userId']+"-"+ result["firstName"] + " " + result["lastName"]+"'> Follow</button>" +
                        "</td>";
                    }
                    //check if the user is following the other user
                    else if(user_role == "User" && all_reviews[i]['userId'] !== parseInt(user_id) && followings.includes(all_reviews[i]['userId'])){
                        //add unfollow button
                        iTABLE += "<td id='reviews-buttons'>" + 
                        "<button type='button' class='btn place-unfollow-button' value='"+all_reviews[i]['userId']+"-"+ result["firstName"] + " " + result["lastName"]+"'> UnFollow</button>" +
                        "</td>";
                    }
                    //check if the user is not admin, display nothing
                    else if(user_role == "User" && all_reviews[i]['userId'] !== parseInt(user_id)){
                        iTABLE += "<td></td>";
                    }
                    //check if the user is not admin, display delete button
                    else if(user_role == "Admin"){
                        iTABLE += "<td id='reviews-buttons'>" + 
                        "<button type='button' class='btn admin-delete-button' value='"+all_reviews[i]['revewsId']+"-"+ result["firstName"] + " " + result["lastName"]+"'> Delete</button>" +
                        "</td>";
                    }
                    
                    iTABLE += "</tr> ";
                    tableBody.append(iTABLE);
                    
                },
                error: function (request, msg, error) {
                }
            });
        }
    }, 100);
}