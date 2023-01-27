/**
 * front end functionality and event handler for account setting page
 * this page is for both admin and users where they can manage their user informations
 */
$(document).ready(function(e){

    // set the viewd page value in local storage
    localStorage.setItem("page", "accountsettings");
    // get token and user information from local storage
    let token = localStorage.getItem('token');
    let user_id = localStorage.getItem("userId");
    let user_role = localStorage.getItem("userRole");
    // boolean variable to indetify user type when updating user inforamtion
    let isUser = false;
    let isAdmin = false;
    
    // get the api links from global.js
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json});
  
    // if the current user is admin, hide profile option from the navigation dropdown
    if(user_role === "Admin"){
        $('.nav-profile').addClass('profile');
    }



    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        // GET request to retireve user data
        $.ajax({
            url: api.get_user_by_userid + user_id,
            method: 'GET',
            mode: 'cors',
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            success: function (result) {
                // set the result data in the account settings input fields
                $("#fname").val(result["firstName"]);
                $("#lname").val(result["lastName"]);
                $("#emailInput").val(result["email"]);

                /**
                 * set the user type input value to the isUser value (admin or user)
                 * update the boolean value according to the user type
                */
                if(result["isUser"] == true){
                    $("#userType").val("User");
                    isUser = true;
                }
                else{
                    $("#userType").val("Admin");
                    isAdmin = true;
                }
            },
            error: function (request, msg, error) {
                // display error message if the request failed
                $("#acc-sett-msg").text("Something went wrong while retireving user information!");
            }
        });// end of request
    }, 100);// end of settimeout



    // edit button click handler
    $("#edit-button").on('click', function(){
        // PUT request to update the user data
        $.ajax({
            url: api.put_user_by_userid + user_id,
            method: 'PUT',
            mode: 'cors',
            // set the json data that will be sent to backend to update user data
            data: JSON.stringify({
                "userId": parseInt(user_id),
                "firstName": $("#fname").val(), 
                "lastName": $("#lname").val(), 
                "email": $("#emailInput").val(),
                "password": '',
                "isUser": isUser,
                "isAdmin": isAdmin
            }),
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            success: function (result) {
                // reload the page
                location.reload();

                // set the account settings fields with the new updated values
                $("#fname").val(result["firstName"]);
                $("#lname").val(result["lastName"]);
                $("#emailInput").val(result["email"]);

                // set the user type according to isUser value
                if(result["isUser"] == true){
                    $("#userType").val("User");
                }
                else{
                    $("#userType").val("Admin");
                }
            },
            error: function (request, msg, error) {
                // display error message if the request failed
                $("#acc-sett-msg").text("Something went wrong while updating user account settings!");
            }
        });// end of request
    });// end of event handler
});// end of document ready