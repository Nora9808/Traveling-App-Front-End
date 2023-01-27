/**
 * This file contains the functionality for review details page
 * It manages all the review details page api calls and evet handlers
*/
$(document).ready(function(e){
    //get a review id and api token
    let reviewId = localStorage.getItem("reviewId");
    let token = localStorage.getItem('token');
    //array to store user data
    var user_data = []
    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json}); 

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        //GET call to get the review information
        $.ajax({
            url: api.get_review_by_reviewid + reviewId,
            method: 'GET',
            mode: 'cors',
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            success: function (result) {
                user_data = result;
                //display data in html form
                $("#place-input").val(result['placeName']);
                $("#rating-input").val(parseFloat(result['rating']));
                $("#review-textarea").text(result['reviews1']);
            },
            error: function (request, msg, error) {
            }
        });

        //edit button click handler
        $(document).on("click", "#edit-button", function () {
            //get review information from html form
            let place_input =  $("#place-input").val();
            let rating_input =  $("#rating-input").val();
            let review_textarea = $("#review-textarea").val();
            
            //PUT call to update the review details
            $.ajax({
                url: api.put_review_by_reviewid + reviewId,
                method: 'PUT',
                mode: 'cors',
                data: JSON.stringify({
                    "revewsId": user_data['revewsId'], 
                    "placeId": user_data['placeId'], 
                    "userId": user_data['userId'],
                    "placeName": place_input, 
                    "reviews1": review_textarea, 
                    "rating": parseFloat(rating_input),
                    "dateCreated": user_data['dateCreated'
                ]}),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function (result) {
                    //reload the page and display the updated details
                    location.reload();
                    $("#place-input").val(result['placeName']);
                    $("#rating-input").val(parseFloat(result['rating']));
                    $("#review-textarea").text(result['reviews1']);
                    
                },
                error: function (request, msg, error) {
                }
            });
        });
    }, 100);
});