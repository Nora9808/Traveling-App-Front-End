/**
 * This file contains the functionality for login page
 * It manages all the login page api calls and evet handlers
*/
$(document).ready(function(e){
    //set the loaded page type to login
    localStorage.setItem("page", "login");
    // array to store all the api links from global.json
    var api = [];
   $.getJSON('../js/global.json', function(json) {api = json}); 

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        //login click event handler
        $("#login-button").on('click', function(){

            //get email and password
            var email = $("#login-email").val();
            var password = $("#login-password").val();
            
            //check if any input is empty
            if(email != null || email != "" && password != null || password == ""){
                // POST call to authenticate the login information
                $.ajax({
                    url: api.post_authenticate_login,
                    method: 'POST',
                    mode: 'cors',
                    data: JSON.stringify({"email": email, "password": password}),
                    contentType: 'application/json',
                    success: function(result) {
                        //set the token, user name, id and role in local storage
                        localStorage.setItem("token", result["token"]);
                        localStorage.setItem("userName", result["userName"]);
                        localStorage.setItem("userId", result["id"]);
                        localStorage.setItem("userRole", result["userRole"]);

                        //check user type to direct the user to proper main page
                        if(result["userRole"] == "User"){
                            window.location.href="../html/userMain.html";
                        }
                        else{
                            window.location.href="../html/adminMain.html";
                        }
                    },
                    // handle errors
                    error: function(request,msg,error) {
                        $("#login-message").text("Something went wrong while logging in!");
                        $("#login-message").css("color", "red");
                    }
                });
            }
            //handle empty inputs
            else{
                $("#login-message").text("Empty Email or Password!");
                $("#login-message").css("color", "red");
            }
        });

        //signup click event handler
        $("#signup-button").on('click', function(){
            //get the input values
            var fName = $("#signup-fname").val();
            var lName = $("#signup-lname").val();
            var email = $("#signup-email").val();
            var password = $("#singup-password").val();
            var confirm_password = $("#singup-conpassword").val();
            
            //check the password
            if(password !== confirm_password){
                $("#signup-message").text("Passwords do not match!");
                $("#signup-message").css("color", "red");
            }
            //check the password length
            else if(password.length < 7){
                $("#signup-message").text("Passwords length must be at least 7 characters!");
                $("#signup-message").css("color", "red");
            }
            //check for any empty input
            else if(email !== null || email !== "" && password !== null || password === ""
            && fName !== null || fName !== "" && lName !== null || lName !== "" 
            && confirm_password !== null || confirm_password !== ""){
                // POST call to authenticate the user credintials
                $.ajax({
                    url: api.post_authenticate_signup,
                    method: 'POST',
                    mode: 'cors',
                    data: JSON.stringify({"firstName": fName, "lastName": lName, "email": email, "password": password,
                    "isUser": true, "isAdmin": false}),
                    contentType: 'application/json',
                    success: function(result) {

                        $("#signup-message").text("User Successsfully created, please try to login.");
                        $("#signup-message").css("color", "green");
                        //empty the input fields
                        $("#signup-fname").val('');
                        $("#signup-lname").val('');
                        $("#signup-email").val('');
                        $("#singup-password").val('');
                        $("#singup-conpassword").val('');
                    },
                    // handle errors
                    error: function(request,msg,error) {
                        $("#signup-message").text("Something went wrong while Signing Up!");
                        $("#signup-message").css("color", "red");
                    }
                });
            }
            //handle empty fields
            else{
                $("#signup-message").text("One or more fields are empty");
                $("#signup-message").css("color", "red");
            }
        });
    }, 100);
});