$(document).ready(function(e){
    //get token, user id, and loaded element type
    let token = localStorage.getItem('token');
    let user_id = localStorage.getItem('userId');
    let loaded_element = localStorage.getItem("loaded-element");
    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json}); 

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
        get_user_reviews(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    });

    // next page click 
    $("#next-link").on('click', function(){
        pageNum ++;
        get_user_reviews(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    });

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        // a function to load user reviews data
        get_user_reviews(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    }, 100);

    //delete button click handler
    $(document).on("click", ".review-delete-button", function (e) {
        e.stopImmediatePropagation();
        //get review id and name
        let reviewId = $(this).val().split('-')[0];
        let name = $(this).val().split('-')[1];
        //confirm if the user wants to delete a review
        $.confirm({
            title: 'Delete!',
            content: 'Are you sure want to delete '+ name + ' review?',
            buttons: {
                confirm: function () {
                    //DELETE call to delete the review by review id
                    $.ajax({
                        url: api.delete_review_by_reviewid + reviewId,
                        method: 'DELETE',
                        mode: 'cors',
                        contentType: 'application/json',
                        headers: { Authorization: 'Bearer ' + token },
                        success: function (result) {
                            $.alert('Deleted!');
                            //reload review section
                            $("#user-profile-content").load("../html/reviews.html");
                            $.getScript("../js/reviews.js");
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


    //review edit click handler
    $(document).on("click", ".review-edit-button", function (e) {
        //get review id
        let reviewId = $(this).val().split('-')[0];

        //redirect to review details page
        localStorage.setItem("reviewId", reviewId);
        window.location.href="../html/review.html";
    });
});

function get_user_reviews(api, token, user_id, loaded_element, pageNum){
    //check the loaded page type
    if(loaded_element === "reviews"){
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
                        get_user_reviews(api, token, user_id, loaded_element, pageNum-1);
                        $("#page-num").text(pageNum-1);
                    }
                }
                else{
                    var tableBody = $("#reviews-tbody");
                    var iTABLE = "";
                    for (let i = 0; i < result.length; i++) {
                        iTABLE += "<tr> ";
                        iTABLE += "<td class='row-id'>" + (i+1) + "</td>";
                        iTABLE += "<td class ='place-name-cell'>" + result[i]['placeName']+ "</td>";
                        iTABLE += "<td>" + result[i]['reviews1'] + "</td>";
                        iTABLE += "<td>" + parseFloat(result[i]['rating']) + "</td>";
                        iTABLE += "<td id='reviews-buttons'>" + 
                        "<button type='button' class='btn review-edit-button' value='"+result[i]['revewsId']+'-'+ result[i]['placeName'] +"'> Edit</button>" +
                        "<button type='button' class='btn review-delete-button' value='"+result[i]['revewsId']+'-'+ result[i]['placeName'] +"'>Delete</button>"+ 
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