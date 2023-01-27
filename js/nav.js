/**
 * This file contains the functionality for the navigation bar
 * It manages all the navigation bar and evet handlers
*/
$(document).ready(function(e){
   //get the token
   let token = localStorage.getItem('token');
   // array to store all the api links from global.json
   var api = [];
   $.getJSON('../js/global.json', function(json) {api = json}); 

   //set the user name in nav bar
   $("#user-nav-button").text(localStorage.getItem("userName"));

   //login click event handler
   $("#login-nav-button").on('click', function(){
     //redirect to login page
     window.location.href="../html/login.html";
   });

   let isShow = false;
   //username click event handler
   $("#user-nav-button").on('click', function(){
     //if dropdown is not displayed
     if(isShow == false){
        //display the dropdown items
        $(".nav-profile").fadeIn();
        $(".nav-dashboard").fadeIn();
        $(".nav-account-settings").fadeIn();
        $(".nav-logout").fadeIn();
        isShow = true;
     }
     //if dropdown is displayed
     else{
        //hide the dropdown items
        $(".nav-profile").fadeOut();
        $(".nav-dashboard").fadeOut();
        $(".nav-account-settings").fadeOut();
        $(".nav-logout").fadeOut();
        isShow = false;
     }
    });

    //profile item click handler
    $(".nav-profile").on('click', function(){
          //redirect to user profile
          window.location.href="../html/profile.html";
    });

    //dashboard item click event
    $(".nav-dashboard").on('click', function(){
          //check user type and redirect to the proper main page
          if(localStorage.getItem("userRole") == "User"){
               window.location.href="../html/userMain.html";
          }
          else{
               window.location.href="../html/adminMain.html";
          }
    });

    //account settings click handler
    $(".nav-account-settings").on('click', function(){
          //redirect to account settings page
          window.location.href="../html/accountSetting.html";
    });

    //logout click handler
    $(".nav-logout").on('click', function(){
          //clear the local storage and redirect to index page
          localStorage.clear();
          window.location.href="../index.html";
    });


    //search button click handler
    $("#search-button").on('click', function(e){
        e.preventDefault();
        //get search value
        let search_key = $("#search-value").val();
        setTimeout(function(){
          //function for place searching
          searchContinent(search_key, token, api);
        }, 100);
        
   });

});

/**
 * this function search for the continent by place name
 * @param {*} continentName : continent name
 * @param {*} token : token value
 * @param {*} api : api array
 */
function searchContinent(continentName, token, api){
     //GET call to get the continent by place name
    $.ajax({
         url: api.get_search_continent + continentName,
         method: 'GET',
         mode: 'cors',
         contentType: 'application/json',
         headers: { Authorization: 'Bearer ' + token },
         success: function (result) {
              //if place was not found
              if(result["title"] === "Not Found"){
                   //function to search for country
                   searchCountry(continentName, token, api);
              }
              else{
                   //set continent name, id, description in local storage
                   localStorage.setItem("searchType", "continent"); 
                   localStorage.setItem("searchPlaceId", result["continentId"]);
                   localStorage.setItem("searchPlaceName", result["continentName"]);
                   localStorage.setItem("searchPlaceDescription", result["description"]);
                   $("#search-value").val('');
                   
                   //if the current page is place detials page
                   if(localStorage.getItem("page") == "place"){
                    //reload the page
                    location.reload();
                   }
                   else{
                    //redirect to place details page
                    window.location.href="../html/place.html";
                   }
              }
         },
         error: function (request, msg, error) {
               //if place was not found, search for country
              searchCountry(continentName, token, api);
         }
    });
}

/**
 * this function search for the country by place name
 * @param {*} countryName : country name
 * @param {*} token : token value
 * @param {*} api : api array
 */
function searchCountry(countryName, token, api){
     //GET call to get the country by place name
     $.ajax({
          url: api.get_search_country + countryName,
          method: 'GET',
          mode: 'cors',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + token },
          success: function (result) {
               //if place was not found
               if(result["title"] === "Not Found"){
                    //function to search for city
                    searchCity(countryName, token,api);
               }
               else{
                    //set country name, id, description in local storage
                    localStorage.setItem("searchType", "country"); 
                    localStorage.setItem("searchPlaceId", result["countryId"]);
                    localStorage.setItem("searchPlaceName", result["countryName"]);
                    localStorage.setItem("searchPlaceDescription", result["description"]);
                    $("#search-value").val('');
                    
                    //if the current page is place detials page
                    if(localStorage.getItem("page") == "place"){
                         //reload the page
                         location.reload();
                    }
                    else{
                         //redirect to place details page
                         window.location.href="../html/place.html";
                    }
               }
          },
          error: function (request, msg, error) {
               //if place was not found, search for city
               searchCity(countryName, token, api);
          }
     });
}

/**
 * this function search for the city by place name
 * @param {*} cityName : city name
 * @param {*} token : token value
 * @param {*} api : api array
 */
function searchCity(cityName, token, api){
     //GET call to get the city by place name
     $.ajax({
          url: api.get_search_city + cityName,
          method: 'GET',
          mode: 'cors',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + token },
          success: function (result) {
               //if place was not found
               if(result["title"] === "Not Found"){
                    //return the not found message
                    return result["title"]
               }
               else{
                    //set country name, id, description in local storage
                    localStorage.setItem("searchType", "city"); 
                    localStorage.setItem("searchPlaceId", result["cityId"]);
                    localStorage.setItem("searchPlaceName", result["cityName"]);
                    localStorage.setItem("searchPlaceDescription", result["description"]);
                    $("#search-value").val('');

                    //if the current page is place detials page
                    if(localStorage.getItem("page") == "place"){
                         //reload the page
                         location.reload();
                    }
                    else{
                         //redirect to place details page
                         window.location.href="../html/place.html";
                    }
               }
          },
          error: function (request, msg, error) {
               //display message if place not found
               $("#search-value").val( $("#search-value").val() + " was not found!");
               $("#search-value").css("color", "red");
          }
     });
}