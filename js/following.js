/**
 * This file contains the functionality for user profile - following section
 * It manages all the following api calls and evet handlers
*/
$(document).ready(function(e){
     // get the token, logged user id and the loaded element type
    let token = localStorage.getItem('token');
    let user_id = localStorage.getItem('userId');
    let loaded_element = localStorage.getItem("loaded-element");
    //array to store the followings
    var followings = []
    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json});


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
        get_user_followings(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    });

    // next page click 
    $("#next-link").on('click', function(){
        pageNum ++;
        get_user_followings(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    });


    setTimeout(function(){
        get_user_followings(api, token, user_id, loaded_element, pageNum);
    }, 100);
    

    //unfollow event handler
    $(document).on("click", ".user-profile-unfollow-button", function (e) {
        let followingId = $(this).val().split("-")[0];
        let followingName = $(this).val().split("-")[1];

        //confirm if the user wants to unfollow 
        $.confirm({
            title: 'Unfollow!',
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
                            $.alert('Done!');
                            //reload following section in user profile
                            $("#user-profile-content").load("../html/following.html");   
                            $.getScript("../js/following.js");
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

    //following username click event handler
    $(document).on("click", ".following-username", function (e) {
        e.stopImmediatePropagation();
        //get he following name and id
        let followingName = e.currentTarget.innerText;
        let followingId = e.target.attributes.value.value;
        //store the name, id, following type in local storage
        localStorage.setItem("followingId", followingId);
        localStorage.setItem("followingName", followingName);
        localStorage.setItem("followingType", "follow");
        //redirect to following profile
        window.location.href="../html/followingProfile.html";
       
    });

});

function get_user_followings(api, token, user_id, loaded_element, pageNum){
    
    //the the loaded type
    if(loaded_element === "following"){
        //GET call to get all the following that the logged user follows
        $.ajax({
            url: api.get_followings_by_userid + user_id + "?pageNum=" + pageNum,
            method: 'GET',
            mode: 'cors',
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            success: function (result) {

                //display the followings in a table
                if(result.length === 0){
                    pageNum --;
                    if(pageNum > 1){
                        get_user_followings(api, token, user_id, loaded_element, pageNum-1);
                        $("#page-num").text(pageNum-1);
                    }
                }
                else{
                    //store the result in followings array
                    followings = result;
                    //display the result in the table
                    var tableBody = $("#folowing-tbody");
                    var iTABLE = "";
                    for (let i = 0; i < result.length; i++) {
                        iTABLE += "<tr> ";
                        iTABLE += "<td class='row-id'>" + (i+1) + "</td>";
                        iTABLE += "<td><a href='#' class='following-username' value='"+result[i]['userId']+"'>" + result[i]['firstName'] + " " + result[i]['lastName']+ "</a></td>";
                        iTABLE += "<td id='favorites-buttons'>" + 
                        "<button type='button' class='btn user-profile-unfollow-button' value='"+result[i]['userId']+ "-" + result[i]['firstName'] + " " + result[i]['lastName']+ "'>Unfollow</button>" 
                        "</td>";
                        iTABLE += "</tr> ";
                    }
                    tableBody.html(iTABLE);
                }
            },
            error: function (request, msg, error) {
            }
        });
    }
}