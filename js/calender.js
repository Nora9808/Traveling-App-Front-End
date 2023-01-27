/**
 * This file contains the functionality for user profile - calender section
 * It manages all the calender api calls and evet handlers
*/
$(document).ready(function(e){
  // get the token and looged in user id
  let token = localStorage.getItem('token');
  let user_id = localStorage.getItem('userId');
  
  // array to holde the api link in global.json
  var api = [];
  $.getJSON('../js/global.json', function(json) {api = json});

  // get the content continer to add the calendar
  var calendarEl = document.getElementById('user-profile-content');
  // get today's date with Date() object
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var this_month = yyyy  + '-' + mm;
  today = yyyy  + '-' + mm + '-' + dd;
  var all_events = []
  var all_calender_events = []

  /**
   * set timeout to 100 milisecond to make sure the api links are
   * completly loaded before any ajax call
  */
  setTimeout(function(){

    // GET call to retreive all the events
    $.ajax({
      url: api.get_events,
      method: 'GET',
      mode: 'cors',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      success: function (result) {
        all_events = result;

        // check this month's events and puch them to calender_events array
        for(let x = 0; x < result.length; x++){
          if(result[x]['startDate'].includes(this_month)){
            // push the title and start date to the array
            all_calender_events.push({
              title: result[x]['event'],
              start: result[x]['startDate'].split("T")[0]
            });
          }
        }
      },
      error: function () {}
    });
  }, 300);
  

  /**
   * set timeout to 100 milisecond to make sure the events are 
   * retireived before displaying them in the calender
  */
  setTimeout(function(){
   
    // create google caledar
    var calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'interaction', 'dayGrid' ],
      defaultDate: today,
      editable: true,
      eventLimit: true, 
      events: all_calender_events
    });
    calendar.render();
    
    // click event for this month's caledar cells
    $(".fc-day").on('click', function(e){
      // function to display the events details 
      goToEventDetailsPage(e, token, user_id, api);
    });

    // click event for fture month's caledar cells
    $(".fc-future").on('click', function(e){
      // function to display the events details 
      goToEventDetailsPage(e, token, user_id, api);
    });

    // add new event button event handler
    $(".add-to-event-btn").on('click',function(e){
      e.stopImmediatePropagation();
      // go to event form page
      $("#user-profile-content").load("../html/event.html");
      
      // give time to load event form page before hiding the buttons
      setTimeout(function(){
        // hide edit and delete buttons
        $(".edit-event-btn").hide();
        $(".delete-event-btn").hide();
      }, 50);
    });


    // new event click event, for the new event form 
    $(document).on("click", ".add-new-event-btn", function (e) {
      e.stopImmediatePropagation();
      
      // get inputs values for the new event 
      let title = $("#event-title").val();
      let location = $("#event-location").val();
      let details = $("#event-detials").val();
      let startDate = $("#event-sdate").val();
      let endDate = $("#event-edate").val();
      let time = $("#event-time").val();
      var sdate = all_events.map(item => item.startDate);

      // check if any input field is empty
      if (title === '' || title === null || location === '' || location === null ||
      details === '' || details === null || startDate === '' || startDate === null ||
      endDate === '' || endDate === null || time === '' || time === null){
        $("#acc-sett-msg").text("One or more fields are empty, Please fill all fields before editing!");
      }
      // check if another event is happening on the same start date
      else if(sdate.includes(startDate+"T00:00:00")){
        $("#acc-sett-msg").text("Another event is happening on start date" + startDate );

      }
      // if all inputs are correct
      else{
        
        var eventId = 0;
        // POST call to create the new events
        $.ajax({
          url: api.post_new_event,
          method: 'POST',
          mode: 'cors',
          data: JSON.stringify({
            "userId": parseInt(user_id),
            "event": title,
            "location": location,
            "details": details, 
            "endDate": endDate, 
            "startDate": startDate,
            "time": startDate +"T"+time
          }),
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + token },
          success: function (result) {

            // store the new event id in a variable
            eventId = result["eventsId"];
          },
          error: function (request, msg, error) {
            $("#acc-sett-msg").text("Something went wrong while creating the event!");
          }
        });
        

        // give time to the POST call to be completed before implementing this call 
        setTimeout(function(){
        
          // POST call to add the new event in user events table
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

              // redirect to user profile
              localStorage.setItem("loaded-element", "calender");
              $("#user-profile-content").empty();
              $.getScript("../js/calender.js");
              $.getScript("../js/events.js");     
              $("#acc-sett-msg").text("");
            },
            error: function (request, msg, error) {
              $("#acc-sett-msg").text("Something went wrong while processing the attendance!");
            }
          });
        }, 100)
      }

    });


    // edit event button event handler
    $(document).on("click", ".edit-event-btn", function (e) {
      e.stopImmediatePropagation();

      // get event id, event user id (event owner)
      let event_id = localStorage.getItem("eventsId");
      let event_userId = localStorage.getItem("event_userId");

      //get all the inputs values
      let title = $("#event-title").val();
      let location = $("#event-location").val();
      let details = $("#event-detials").val();
      let startDate = $("#event-sdate").val();
      let endDate = $("#event-edate").val();
      let time = $("#event-time").val();
      var sdate = all_events.map(item => item.startDate);
      var event_start_date = localStorage.getItem("event_start_date");

      //check for empty input
      if (title === '' || title === null || location === '' || location === null ||
      details === '' || details === null || startDate === '' || startDate === null ||
      endDate === '' || endDate === null || time === '' || time === null){
        $("#acc-sett-msg").text("One or more fields are empty, Please fill all fields before editing!");
      }
      //check if any event is happening in the same start date
      else if(startDate !== event_start_date){
        if(sdate.includes(startDate+"T00:00:00")){
          $("#acc-sett-msg").text("Another event is happening on start date" + startDate );
        }
      }
      //if all data are correct
      else{
        // PUT call to update the event
        $.ajax({
          url: api.put_event_by_eventid + parseInt(event_id),
          method: 'PUT',
          mode: 'cors',
          data: JSON.stringify({
            "eventsId": parseInt(event_id),  
            "userId": parseInt(event_userId),
            "event": title,
            "location": location,
            "details": details, 
            "endDate": endDate, 
            "startDate": startDate,
            "time":startDate +"T"+time
          }),
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + token },
          success: function (result) {

            //redirect to calender page
            localStorage.setItem("loaded-element", "calender");
            $("#user-profile-content").empty();
            $.getScript("../js/calender.js");
            $.getScript("../js/events.js");     
          },
          error: function (request, msg, error) {
            $("#acc-sett-msg").text("Something went wrong while editing the event!");
          }
        });
      }
      
    });


    // delete event handler
    $(document).on("click", ".delete-event-btn", function (e) {
      e.stopImmediatePropagation();

      // get event id
      let event_id = localStorage.getItem("eventsId");
      
      // confirm if the user wants to delete the event
      $.confirm({
        title: 'Delete!',
        content: 'Are you sure want to delete  this event?',
        buttons: {
          confirm: function () {
            
            // DELETE call to delete the event form events table
            $.ajax({
              url: api.delete_event_by_eventid + event_id,
              method: 'DELETE',
              mode: 'cors',
              contentType: 'application/json',
              headers: { Authorization: 'Bearer ' + token },
              success: function (result) {
              },
              error: function (request, msg, error) {
                $("#acc-sett-msg").text("Something went wrong while deleting the event!");
              }
            });


            //DELETE call to delete the event from user events table
            $.ajax({
              url: api.delete_user_event_by_eventid + event_id,
              method: 'DELETE',
              mode: 'cors',
              contentType: 'application/json',
              headers: { Authorization: 'Bearer ' + token },
              success: function (result) {
                
                //redirect to calendar
                localStorage.setItem("loaded-element", "calender");
                $("#user-profile-content").empty();
                $.getScript("../js/calender.js");
                $.getScript("../js/events.js");     
              },
              error: function (request, msg, error) {
                $("#acc-sett-msg").text("Something went wrong while deleting the event!");
              }
            });

          },
          cancel: function () {
            $.alert('Canceled!');
          }
        }
      });
    });
  }, 500);
});

/**
 * this function will load the data in event details form page
 * @param {*} e : caleder cell value
 * @param {*} token : api token value
 * @param {*} user_id : logged user id
 * @param {*} api : api to get the event details
 */
function goToEventDetailsPage(e, token, user_id, api){
  e.stopImmediatePropagation();

  //get clicked date and calendar cell type
  var clicked_date = e["currentTarget"]["dataset"]["date"];
  let day_type = e["currentTarget"]["classList"][3];

  localStorage.setItem("clickedDate", clicked_date);

  // GET call to get the event details by start date
  $.ajax({
    url: api.get_event_details_by_startdate + clicked_date,
    method: 'GET',
    mode: 'cors',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    success: function (result) {
      
      // check if the clicked day is this month
      if(day_type !== "fc-other-month"){

        // load event details page and hide add new button
        $("#user-profile-content").load("../html/event.html");
      }
      
      setTimeout(function(){
        $(".add-new-event-btn").hide();
        
        // if the logged user is not the event owner, hide the edit and delete buttons
        if(result["userId"] !== parseInt(user_id)){
          $(".edit-event-btn").hide();
          $(".delete-event-btn").hide();
        }

        // set event id and event user id (event owner) in local storage
        localStorage.setItem("eventsId", result["eventsId"]);
        localStorage.setItem("event_userId", result["userId"]);
        localStorage.setItem("event_start_date", result["startDate"].split("T")[0]);

        // display the retreived details in the form inputs
        $("#event-title").val(result["event"]);
        $("#event-location").val(result["location"]);
        $("#event-detials").text(result["details"]);
        $("#event-sdate").val(result["startDate"].split("T")[0]);
        $("#event-edate").val(result["endDate"].split("T")[0]);
        $("#event-time").val(result["time"].split("T")[1]);
      }, 50);
      
    },
    error: function (request, msg, error) {
      localStorage.setItem("loaded-element", "calender");
      $("#user-profile-content").empty();
      $.getScript("../js/calender.js");
      $.getScript("../js/events.js");   
    }
  });
}