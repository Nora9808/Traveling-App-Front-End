/**
 * front end functionality and event handler for admin main page
 * this page is for admin ony, where the charts and app data will be displayed
 */
$(document).ready(function(e){ 

  // set the viewd page value in local storage
  localStorage.setItem("page", "adminmain");
  // get the token from lcal storage
  let token = localStorage.getItem('token');
  
  // array for reviews date created
  let reviewDates = []
  // array for review palce id and place name
  let reviews = []
  // array to hold the sorted reviews to display the most reviewed places
  let reviewTableData = []
  // array to hold the data that will be used o display in google chart
  let reviewsResultData = []
  // hold the total number of reviews
  let reviewSum = 0;
  
 // get the api links from global.js
 var api = [];
 $.getJSON('../js/global.json', function(json) {api = json});


  /**
   * set timeout to 100 milisecond to make sure the api links are
   * completly loaded before any ajax call
  */
  setTimeout(function(){
    // GET request to get all reviews
    $.ajax({
      url: api.get_reviews,
      method: 'GET',
      mode: 'cors',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      success: function (result) {
        
        for(i in result){
          // push to reviews array
          reviews.push([result[i]["placeId"], result[i]["placeName"]])
          
          // push dates to reviewDates array
          reviewDates.push(result[i]['dateCreated'].split('T')[0]);
          // increase reviewSum
          reviewSum += 1;
        }

        // set the number of reviews in local storage
        localStorage.setItem("reviewSum", reviewSum);

        // send reviewDate to group by function to group the array by dates
        reviewsResultData = groupBy(reviewDates);
        // send reviewDate to group by function to group the array by place id and name 
        reviewTableData = groupBy(reviews)

        // sort the review table data ascendingly 
        reviewTableData = reviewTableData.sort(function(a, b) {
          return b[1] - a[1];
        });

        // set the review table data in local storage
        localStorage.setItem("reviewsResultData", JSON.stringify(reviewsResultData));

        let length = 0;
        if(reviewTableData.length > 3){
          length = 3;
        }
        else{
          length = reviewTableData.length;;
        }

        // display the reviewa table data in the table form tbody
        var tableBody = $("#tbody");
        var iTABLE = "";
        for (let i = 0; i < length; i++) {
            iTABLE += "<tr> ";
            iTABLE += "<td>" + (i+1) + "</td>";
            iTABLE += "<td>" + reviewTableData[i][0].split(",")[1]+ "</td>";
            iTABLE += "<td>" + reviewTableData[i][1] + "</td>";
            iTABLE += "</tr> ";
        }
        tableBody.html(iTABLE);
      },
      error: function () {}
    });


    // array for user created dates
    let userDates = []
    // array for sorted user created dates
    let userResultData = []
    // hold total number of users
    let userSum = 0;
    // GET request to get all users
    $.ajax({
      url: api.get_users,
      method: 'GET',
      mode: 'cors',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      success: function (result) {
        // get user date created
        for(i in result){
          // push the dates in userDates array
          userDates.push(result[i]['dateCreated'].split('T')[0]);
          // increase userSum
          userSum += 1;
        }

        // set userSum in local storage
        localStorage.setItem("userSum", userSum);
        // send userDates array to group by function to group by dates
        userResultData = groupBy(userDates);
        // set the userResultData in local storage
        localStorage.setItem("userResultData", JSON.stringify(userResultData));

      },
      error: function (request, msg, error) {
      }
    });// end of ajax request
  }, 100);// end of settimeout

  

  /**
   * set timeout to 100 milisecond to make sure the reviews and
   * users data are completly retrieved 
  */
  setTimeout(function(){

    // get user and reviews data from local storage 
    var all_reviewsResultData = JSON.parse(localStorage.getItem('reviewsResultData'));
    var all_userResultData = JSON.parse(localStorage.getItem('userResultData'));

    // load google charts
    google.charts.load('current', {packages: ['corechart', 'line']});
    // load the first chart for user data
    google.charts.setOnLoadCallback(function(){drawLeftChart(all_reviewsResultData)});
    // load the second chart for reviews data
    google.charts.setOnLoadCallback(function(){drawRightChart(all_userResultData)});

    // set the total number of users and review in the html element
    $("#user-number").text(localStorage.getItem("reviewSum"));
    $("#reviews-number").text(localStorage.getItem("userSum"));

    // click handler for data manegement option
    $("#left-option").on('click', function(){
      // redirect to management page
      window.location.href="../html/management.html";
    });

    // click handler for account settings page
    $("#right-option").on('click', function(){
      // redirect to account settings page
      window.location.href="../html/accountSetting.html";
    });
  },500); // end of settimeout
});// end of document get ready


/**
  * this function will load the google chart for reviews data
  * 
  * @param {*} all_reviewsResultData : reviews data 
*/
function drawLeftChart(all_reviewsResultData) {
  // set the data table
  var data = new google.visualization.DataTable();
  // set the chart column type and name
  data.addColumn('string', 'date');
  data.addColumn('number', '#');

  // add the reviews data to the chart rows
  data.addRows(all_reviewsResultData);

  // set the width, title and background color of the chart
  var options = {
    width: 1250,
    hAxis: {
      title: 'Date'
    },
    vAxis: {
      title: '# of Users'
    },
    backgroundColor: 'EBBBA4'
  };

  // set and draw the chart
  var chart = new google.visualization.LineChart(document.getElementById('left-chart'));
  chart.draw(data, options);
}


/**
  * this function will load the google chart for user data
  * 
  * @param {*} all_userResultData : users data 
*/
function drawRightChart(all_userResultData) {
  // set the data table
  var data = new google.visualization.DataTable();
  // set the chart column type and name
  data.addColumn('string', 'date');
  data.addColumn('number', '#');

  // add the reviews data to the chart rows
  data.addRows(all_userResultData);

  // set the width, title and background color of the chart
  var options = {
    width: 1250,
    hAxis: {
      title: 'Date'
    },
    vAxis: {
      title: '# of Reviews'
    },
    backgroundColor: 'EBBBA4'
  };

  // set and draw the chart
  var chart = new google.visualization.LineChart(document.getElementById('right-chart'));
  chart.draw(data, options);
}

/**
 * this method will group the data according to the item parameter
 * @param {*} item : data to be grouped
 * @returns : grouped data
 */
function groupBy(item){
  // return the grouped data
  return Object.entries(item.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null)));
}