/**
 * This file contains the functionality for user profile - events list section
 * It manages all the collections api calls and evet handlers
 */
$(document).ready(function(e){
  // get token and logged user id
  let token = localStorage.getItem('token');
  let user_id = localStorage.getItem('userId');
  var type = "all"
  // array to holde the api link in global.json
  var api = [];
  $.getJSON('../js/global.json', function(json) {api = json});
  // display table pagination
  let pageNum = 1;

  // creating [Add new event] and [Go to evens] buttons
  let plcae_elements = "<br><button type='button' class='btn add-to-event-btn mb-5'>Add New Event</button>";
  plcae_elements += "<br><button type='button' class='btn go-to-event-btn mb-5'>Go To Events</button>";
  $("#user-profile-content").html(plcae_elements);
  
  //[go to events] buttons event handler
  $(".go-to-event-btn").on('click',function(e){
      $("#user-profile-content").load("../html/events.html");
      setTimeout(function(){
          getEvents(api, token, null, user_id, type, pageNum);
          $("#page-num").text(pageNum);
    
      }, 100);
  });


  // previouse page click
  $("#prev-link").on('click', function(){
    pageNum = $("#page-num").val();
    if(pageNum > 1){
        pageNum--;
    }
    else{
        pageNum = 1;
    }
    getEvents(api, token, null, user_id, type, pageNum);
    $("#page-num").text(pageNum);
  });

  // next page click 
  $("#next-link").on('click', function(){
      pageNum ++;
      getEvents(api, token, null, user_id, type, pageNum);
      $("#page-num").text(pageNum);
  });


  //event search event handler
  $(document).on("click", "#find-event-button", function (e) {
      e.preventDefault();
      //get search value
      let search_value = $("#search-event-input").val();
      //a function to filter and display the event list result
      
      type = "search"
      getEvents(api, token, search_value, user_id, type, 1);
  });

  //[all events] checkbox event handler
  $(document).on('change', '#all-events-checkbox', function(e) {
      e.stopImmediatePropagation();
      if(this.checked) {
        //uncheck the other checkbox
        $( "#my-events-checkbox" ).prop( "checked", false );
        
        type = "all";
        //a function to filter and display the event list result
        getEvents(api, token, null, user_id, type, 1);
      }
  });

  //[my events] checkbox even handler
  $(document).on('change', '#my-events-checkbox', function(e) {
      e.stopImmediatePropagation();
      if(this.checked) {
        //uncheck the other checkbox
        $( "#all-events-checkbox" ).prop( "checked", false );
        
        type = "my"
        //a function to filter and display the event list result
        getEvents(api, token, null, user_id, type, 1);
      }
  });

  //attendance button event handler
  $(document).on('click', '.callender-attend-btn', function(e) {
    //get event id
    let eventId = e.target.attributes.value.value;
    //POST call to create a new user event
    $.ajax({
      url: api.post_new_user_event,
      method: 'POST',
      mode: 'cors',
      data: JSON.stringify({
        "eventId": parseInt(eventId),  
        "userId": parseInt(user_id),
      }),
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      success: function (result) {
        localStorage.setItem("loaded-element", "calender");
        //redirect to calendar
        $("#user-profile-content").empty();
        $.getScript("../js/calender.js");
      },
      error: function (request, msg, error) {
        $("#acc-sett-msg").text("Something went wrong while processing the attendance!");
      }
    });
  });
});


/**
 * This function filter and display events in events table
 * @param {*} all_user_attendance : attendances array
 * @param {*} all_user_events : user events array
 * @param {*} search_value : search value
 * @param {*} user_id : logged user id
 * @param {*} type : filter type
 */
function getEvents(api, token, search_value='', user_id, type, pageNum){

  // array that will store user events and users attendance
  var all_events = []
  var all_user_events = []
  var all_user_attendance = []

  //GET call to get all user events
  $.ajax({
    url: api.get_user_events,
    method: 'GET',
    mode: 'cors',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    success: function (result) {
      // store the result in the array
      all_user_events = result;
      // group the result by event id
      all_user_attendance = result.reduce( (acc, o) => (acc[o.eventId] = (acc[o.eventId] || 0)+1, acc), {} );
    },
    error: function (request, msg, error) {
    }
  });

  // GET call to retreive all the events
  $.ajax({
    url: api.get_paginated_events + pageNum,
    method: 'GET',
    mode: 'cors',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    success: function (result) {
      all_events = result
    },
    error: function (request, msg, error) {
    }
  });


  setTimeout(function(){
    var tableBody = $("#events-tbody");
    var iTABLE = "";

    // display the events that are equal to search value
    if(type === "search"){
      //display search event result in a table
      if(all_events.length === 0){

        pageNum --;
        if(pageNum > 1){
          getEvents(api, token, null, user_id, type, pageNum-1);
          $("#page-num").text(pageNum-1);
        }
      }
      else{

        for (let i = 0; i < all_events.length; i++) {
          var users_events = [];
          if(all_events[i]['event'].toLowerCase().includes(search_value.toLowerCase())){
            iTABLE += "<tr> ";
            iTABLE += "<td>" + (i+1) + "</td>";
            iTABLE += "<td>" + all_events[i]['event']+ "</td>";
            iTABLE += "<td>" + all_events[i]['startDate'].split("T")[0] + "</td>";
            iTABLE += "<td>" + all_events[i]['endDate'].split("T")[0] + "</td>";
            iTABLE += "<td>" + all_user_attendance[all_events[i]['eventsId']] + "</td>";

            // get all the logged user attended events
            for( num in all_user_events){
              if(all_user_events[num]['eventId'] === all_events[i]["eventsId"]){
                users_events.push(all_user_events[num]["userId"]);
              }
            }
      
            //check if user is attending the event
            if(users_events.includes(parseInt(user_id))){
              iTABLE += "<td>   </td>";
            }
            //check if user is not attending the event
            else{
              iTABLE += "<td>" + "<button type='button' class='btn callender-attend-btn' value='"+all_events[i]['eventsId']+"'>Attend</button>" + "</td>";
            }
            iTABLE += "</tr> ";
          }
        }
      }
    }
    //display the logged user events
    else if(type === "my"){
      //display the user events in a table
      if(all_events.length === 0){

        pageNum --;
        if(pageNum > 1){
          getEvents(api, token, null, user_id, type, pageNum-1);
          $("#page-num").text(pageNum-1);
        }
      }
      else{
        for (let i = 0; i < all_events.length; i++) {
          if(parseInt(all_events[i]['userId']) === parseInt(user_id)){
            iTABLE += "<tr> ";
            iTABLE += "<td>" + (i+1) + "</td>";
            iTABLE += "<td>" + all_events[i]['event']+ "</td>";
            iTABLE += "<td>" + all_events[i]['startDate'].split("T")[0] + "</td>";
            iTABLE += "<td>" + all_events[i]['endDate'].split("T")[0] + "</td>";
            iTABLE += "<td>" + all_user_attendance[all_events[i]['eventsId']] + "</td>";
            iTABLE += "<td>   </td>";
            iTABLE += "</tr> ";
          }
        }
      }
    }
    //display all the events
    else{
      //display the reviews in a table
      if(all_events.length === 0){

        pageNum --;
        if(pageNum > 1){
          getEvents(api, token, null, user_id, type, pageNum-1);
          $("#page-num").text(pageNum-1);
        }
      }
      else{
        for (let i = 0; i < all_events.length; i++) { 
          var users_events = [];
          iTABLE += "<tr> ";
          iTABLE += "<td>" + (i+1) + "</td>";
          iTABLE += "<td>" + all_events[i]['event']+ "</td>";
          iTABLE += "<td>" + all_events[i]['startDate'].split("T")[0] + "</td>";
          iTABLE += "<td>" + all_events[i]['endDate'].split("T")[0] + "</td>";
          iTABLE += "<td>" + all_user_attendance[all_events[i]['eventsId']] + "</td>";
          
          // get all the logged user attended events
          for( num in all_user_events){
            if(all_user_events[num]['eventId'] === all_events[i]["eventsId"]){
              users_events.push(all_user_events[num]["userId"]);
            }
          }

          //check if user is attending the event
          if(users_events.includes(parseInt(user_id))){
            iTABLE += "<td>   </td>";
          }
          //check if user is not attending the event
          else{
            iTABLE += "<td>" + "<button type='button' class='btn callender-attend-btn' value='"+all_events[i]['eventsId']+"'>Attend</button>" + "</td>";
          }

          iTABLE += "</tr> ";
        }
      }
    }
    tableBody.html(iTABLE);
  }, 150);
}