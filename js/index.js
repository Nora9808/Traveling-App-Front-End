/**
 * This file contains the functionality for index page
 * It manages all the index page api calls and evet handlers
*/
$(document).ready(function(e){
   //set the loaded page type to main
   localStorage.setItem("page", "main");
   //get token
   let token = localStorage.getItem('token');
   //get a random number beween the min place id to max place id
   let continent_count = Math.floor(Math.random() * (7 - 1 + 1)) + 1;
   let country_count = Math.floor(Math.random() * (147 - 100 + 1)) + 100;
   let city_count = Math.floor(Math.random() * (1004 - 1000 + 1)) + 1000;
   // array to store all the api links from global.json
   var api = [];
   $.getJSON('../js/global.json', function(json) {api = json}); 


     /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
     setTimeout(function(){   
          //GET call to get a continent by random number  
          $.ajax({
               url: api.get_continent_by_id + continent_count,
               method: 'GET',
               mode: 'cors',
               contentType: 'application/json',
               headers: { Authorization: 'Bearer ' + token },
               success: function (result) {
                    //check if it's not login page
                    if($(".nav-value").text() !== 'LogIn/SignUp'){
                         //diplay the clickable continent image
                         let img_tag = "<a href='#' id='continent-click'><img src='../img/app-imgs/continents/"+continent_count+".jpg' id='continent-img' class='img-fluid' alt='Responsive image'>"
                         img_tag += "<p id='place-name1'>"+result["continentName"]+"</p></a>"
                         $("#continent-container").html(img_tag); 
                         //set the continent name, id, and description in local storage
                         localStorage.setItem("continentId", result["continentId"]);
                         localStorage.setItem("continentName", result["continentName"]);
                         localStorage.setItem("continentDescription", result["description"]);
                    }
                    else{
                         //diplay the unclickable continent image
                         let img_tag = "<img src='img/app-imgs/continents/"+continent_count+".jpg' id='continent-img' class='img-fluid' alt='Responsive image'>"
                         img_tag += "<p id='place-name1'>"+result["continentName"]+"</p>"
                         $("#continent-container").html(img_tag); 
                    }
               },
               error: function (request, msg, error) {
               }
          });

          //GET call to get a country by random number  
          $.ajax({
               url: api.get_country_by_id + country_count,
               method: 'GET',
               mode: 'cors',
               contentType: 'application/json',
               headers: { Authorization: 'Bearer ' + token },
               success: function (result) {
                    //check if it's not login page
                    if($(".nav-value").text() !== 'LogIn/SignUp'){
                         //diplay the clickable country image
                         let img_tag = "<a href='#' id='country-click'><img src='../img/app-imgs/countries/"+country_count+".jpg' id='continent-img' class='img-fluid' alt='Responsive image'>"
                         img_tag += "<p id='place-name2'>"+result["countryName"]+"</p></a>"
                         $("#country-container").html(img_tag); 
                         //set the country name, id, and description in local storage
                         localStorage.setItem("countryId", result["countryId"]);
                         localStorage.setItem("countryName", result["countryName"]);
                         localStorage.setItem("coutryDescription", result["description"]);
                    }
                    else{
                         //diplay the unclickable continent image
                         let img_tag = "<img src='img/app-imgs/countries/"+country_count+".jpg' id='contry-img' class='img-fluid' alt='Responsive image'>"
                         img_tag += "<p id='place-name1'>"+result["countryName"]+"</p>"
                         $("#country-container").html(img_tag); 
                    }
               },
               error: function (request, msg, error) {
               }
          });

          //GET call to get a city by random number  
          $.ajax({
               url: api.get_city_by_id + city_count,
               method: 'GET',
               mode: 'cors',
               contentType: 'application/json',
               headers: { Authorization: 'Bearer ' + token },
               success: function (result) {
                    //check if it's not login page
                    if($(".nav-value").text() !== 'LogIn/SignUp'){
                         //diplay the clickable city image
                         let img_tag = "<a href='#' id='city-click'><img src='../img/app-imgs/cities/"+city_count+".jpg' id='city-img' class='img-fluid' alt='Responsive image'>"
                         img_tag += "<p id='place-name3'>"+result["cityName"]+"</p></a>"
                         $("#city-container").html(img_tag); 
                         //set the city name, id, and description in local storage
                         localStorage.setItem("cityId", result["cityId"]);
                         localStorage.setItem("cityName", result["cityName"]);
                         localStorage.setItem("cityDescription", result["description"]);
                    }
                    else{
                         //diplay the unclickable city image
                         let img_tag = "<img src='img/app-imgs/cities/"+city_count+".jpg' id='city-img' class='img-fluid' alt='Responsive image'>"
                         img_tag += "<a id='place-name3'>"+result["cityName"]+"</a>"
                         $("#city-container").html(img_tag);  
                    }
               },
               error: function (request, msg, error) {
               }
          });
     }, 100);

     //continent image click event
     $(document).on("click", "#continent-click", function (e) {
          //set place type, name, id, and dscription in local storage
          localStorage.setItem("searchType", "continent");
          localStorage.setItem("searchPlaceId", localStorage.getItem("continentId"));
          localStorage.setItem("searchPlaceName", localStorage.getItem("continentName"));
          localStorage.setItem("searchPlaceDescription", localStorage.getItem("continentDescription"));
          //redirect to place table
          window.location.href="../html/place.html";
     });

     //country image click event
     $(document).on("click", "#country-click", function (e) {
          //set place type, name, id, and dscription in local storage
          localStorage.setItem("searchType", "country");
          localStorage.setItem("searchPlaceId", localStorage.getItem("countryId"));
          localStorage.setItem("searchPlaceName", localStorage.getItem("countryName"));
          localStorage.setItem("searchPlaceDescription", localStorage.getItem("coutryDescription"));
          //redirect to place table
          window.location.href="../html/place.html";
     });

     //city image click event
     $(document).on("click", "#city-click", function (e) {
          //set place type, name, id, and dscription in local storage
          localStorage.setItem("searchType", "city");
          localStorage.setItem("searchPlaceId", localStorage.getItem("cityId"));
          localStorage.setItem("searchPlaceName", localStorage.getItem("cityName"));
          localStorage.setItem("searchPlaceDescription", localStorage.getItem("cityDescription"));
          //redirect to place table
          window.location.href="../html/place.html";
     });
});
