/**
 * This file the event handlers for te user profile
 * each event will load different section in the user profile
*/
$(document).ready(function(e){
    //set the page type in local storage
    localStorage.setItem("page", "profile");
    //get and display the username 
    let user_name = localStorage.getItem("userName");
    $("#user-nav-button").text(user_name);
    $("#user-name").text(user_name);

    //initially load the reviews section 
    localStorage.setItem("loaded-element", "reviews");
    $("#user-profile-content").load("../html/reviews.html");
    $.getScript("../js/reviews.js");

    //load review section when scetion title is clicked
    $("a#user-reviews").on('click',function(e){
        localStorage.setItem("loaded-element", "reviews");
        $("#user-profile-content").load("../html/reviews.html");
        $.getScript("../js/reviews.js");
    });

    //load favorites section when scetion title is clicked
    $("a#user-favorites").on('click',function(e){ 
        localStorage.setItem("loaded-element", "favorites");
        $("#user-profile-content").load("../html/favorites.html");   
        $.getScript("../js/favorites.js");
    });

    //load collection section when scetion title is clicked
    $("a#user-collections").on('click',function(e){ 
        localStorage.setItem("loaded-element", "collections");
        $("#user-profile-content").load("../html/collections.html");   
        $.getScript("../js/collections.js");
    });

    //load followings section when scetion title is clicked
    $("a#user-following").on('click',function(e){ 
        localStorage.setItem("loaded-element", "following");
        $("#user-profile-content").load("../html/following.html");   
        $.getScript("../js/following.js");
    });
    
    //load calendar section when scetion title is clicked
    $("a#user-calender").on('click',function(e){ 
        localStorage.setItem("loaded-element", "calender");
        $("#user-profile-content").empty();
        $.getScript("../js/calender.js");
        $.getScript("../js/events.js");  
           
    });
});