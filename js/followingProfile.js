/**
 * This file contains the functionality for following profile
 * It manages all the following profile api calls and evet handlers
*/
$(document).ready(function(e){
    //get token and user id
    let token = localStorage.getItem('token');
    let user_id = localStorage.getItem('userId');
    //get the following name, id, following type in local storage
    let followingId = localStorage.getItem('followingId');
    let followingName = localStorage.getItem('followingName');
    let followingType = localStorage.getItem("followingType");
    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json});

    //check the following type (if the user is following that user or not)
    if(followingType === "follow"){
        $("#following-profile-follow-button").hide();
        $("#following-profile-unfollow-button").show();
    }
    else{
        $("#following-profile-follow-button").show();
        $("#following-profile-unfollow-button").hide();
    }

    //display the user name
    $("#follwoing-user-name").text(followingName);

    // display table pagination
    let pageNum = 1;

    // previouse page click
    $("#prev-link").on('click', function(){
        pageNum = $("#page-num").val();
        if(pageNum > 1){
            pageNum--;
        }
        else{
            pageNum = 1;
        }
        get_following_reviews(api, token, followingId, pageNum);
        $("#page-num").text(pageNum);
    });

    // next page click 
    $("#next-link").on('click', function(){
        pageNum ++;
        get_following_reviews(api, token, followingId, pageNum);
    });

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        get_following_reviews(api, token, followingId, pageNum);
    }, 100);

    //unfollow event hadler
    $("#following-profile-unfollow-button").on('click', function(){

        //confirm if the user wants to unfollow
        $.confirm({
            title: 'Delete!',
            content: 'Are you sure want to unfollow '+ followingName + '?',
            buttons: {
                confirm: function () {
                    //DELETE call to delete/unfollow the user from following table
                    $.ajax({
                        url: api.delete_unfollow_by_userid_followingid + user_id + '&followingId=' + followingId,
                        method: 'DELETE',
                        mode: 'cors',
                        contentType: 'application/json',
                        headers: { Authorization: 'Bearer ' + token },
                        success: function (result) {
                            //reload the page and change the following type to unfollow
                            location.reload();
                            localStorage.setItem("followingType", "unfollow");
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

    //follow event handler
    $("#following-profile-follow-button").on('click', function(){
        //POST call to add the user to the following table
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
              //reload the page and change the following type to unfollow
              location.reload();
              localStorage.setItem("followingType", "follow");
            },
            error: function (request, msg, error) {
              $("#acc-sett-msg").text("Something went wrong while creating the event!");
            }
        });
    });
});

function get_following_reviews(api, token, user_id, pageNum){
    //GET call to get the user's reviews
    $.ajax({
        url: api.get_reviews_by_userid + user_id + "?pageNum=" + pageNum,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            
            //display the reviews in a table
            if(result.length === 0){
                pageNum --;
                if(pageNum > 1){
                    get_following_reviews(api, token, user_id, pageNum-1);
                    $("#page-num").text(pageNum-1);
                }
            }
            else{
                //display the user's reviews in a table
                var tableBody = $("#following-profile-Table");
                var iTABLE = "";
                for (let i = 0; i < result.length; i++) {
                    iTABLE += "<tr> ";
                    iTABLE += "<td class='row-id'>" + (i+1) + "</td>";
                    iTABLE += "<td class ='place-name-cell'>" + result[i]['placeName']+ "</td>";
                    iTABLE += "<td>" + result[i]['reviews1'] + "</td>";
                    iTABLE += "<td>" +  parseFloat(result[i]['rating']) + "</td>";
                    iTABLE += "</tr> ";
                }
                tableBody.html(iTABLE);
            }
            
        },
        error: function (request, msg, error) {
        }
    });

}