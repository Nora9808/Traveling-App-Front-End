/**
 * This file contains the functionality for user profile - favorites section
 * It manages all the favorites api calls and evet handlers
*/
$(document).ready(function(e){

  // get the token, logged user id and the loaded element type
  let token = localStorage.getItem('token');
  let user_id = localStorage.getItem('userId');
  let loaded_element = localStorage.getItem("loaded-element");
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
      get_user_favorites(api, token, user_id, loaded_element, pageNum)
      $("#page-num").text(pageNum);
  });

  // next page click 
  $("#next-link").on('click', function(){
      pageNum ++;
      get_user_favorites(api, token, user_id, loaded_element, pageNum)
      $("#page-num").text(pageNum);
  });


  /**
    * set timeout to 100 milisecond to make sure the api links are
    * completly loaded before any ajax call
  */
  setTimeout(function(){
    get_user_favorites(api, token, user_id, loaded_element, pageNum)
  }, 100);
  

  //delete favorites event handler
  $(document).on("click", ".favorites-delete-button", function (e) {
    e.stopImmediatePropagation();
    //get the favorite id and name
    let favoritesId = $(this).val().split("-")[1];
    let delete_name = $(this).val().split("-")[0];

    //confirm if the user wants to delete the event
    $.confirm({
      title: 'Delete!',
      content: 'Are you sure want to delete '+ delete_name + ' from favorites?',
      buttons: {
        confirm: function () {
          //DELETE call to delete the favrotie item
          $.ajax({
            url: api.delete_favorites_by_favoritesid + favoritesId,
            method: 'DELETE',
            mode: 'cors',
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            success: function (result) {
              $.alert('Deleted!');
              //reload favorits section
              $("#user-profile-content").load("../html/favorites.html");   
              $.getScript("../js/favorites.js"); 
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

  //add to collection event handler
  $(document).on("click", ".favorites-addcollection-button", function (e) {
    e.stopImmediatePropagation();

    //get the favorite place name and id
    let placename = $(this).val().split("-")[0];
    let placeid = $(this).val().split("-")[1];
    //set them in local storage
    localStorage.setItem("placename", placename);
    localStorage.setItem("placeid", placeid);

    // GET call to get all collection by the user id
    $.ajax({
      url: api.get_all_user_collections + user_id,
      method: 'GET',
      mode: 'cors',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      success: function (result) {
        //group the collection by collection name
        let filter_values = result.map(item => item.name)
        .filter((value, index, self) => self.indexOf(value) === index);
      
        //add the grouped collection to pop-up dropdown
        for(index in filter_values){
          var o = new Option(filter_values[index], filter_values[index]);
          $("#collection-dropdown").append(o);
        }

        //add the place name to the pop-up
        $("#coll-place").text(placename);
        //display the pop-up
        $("#pop-up").fadeIn();
      },
      error: function (request, msg, error) {
      }
    });

  });

  //popup cancel event handler
  $("#popup-cancel-btn").on('click', function(){
    //hide the popup
    $("#pop-up").fadeOut();
  });

  //pop-up add to collection event handler
  $(document).on("click", "#popup-add-btn", function (e) {
      e.stopImmediatePropagation();
      //get the selected collection from dropdown
      let selected_coll = $("#collection-dropdown option:selected").text();
      //get place name and id
      let placename = localStorage.getItem("placename");
      let placeid = localStorage.getItem("placeid");
      //POST call to add the place to collections table
      $.ajax({
          url: api.post_to_collection,
          method: 'POST',
          mode: 'cors',
          data: JSON.stringify({"userId": parseInt(user_id),"name": selected_coll,
                              "placeId": parseInt(placeid),"placeName": placename}),
          contentType: 'application/json',
          success: function(result) {
            //reload the page
            localStorage.setItem("loaded-element", "favorites");
            $("#user-profile-content").load("../html/favorites.html");   
            $.getScript("../js/favorites.js");
          },
          // handle errors
          error: function(request,msg,error) {
          }
      });
  });
});


function get_user_favorites(api, token, user_id, loaded_element, pageNum){
  // check the element type that is required to load in user profile
  if(loaded_element == "favorites"){

    //GET call to get all favorite items
    $.ajax({
      url: api.get_favorites_by_userid + user_id + "?pageNum=" + pageNum,
      method: 'GET',
      mode: 'cors',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      success: function (result) {

        //display the result in a table
        if(result.length === 0){
          pageNum --;
          if(pageNum > 1){
            get_user_favorites(api, token, user_id, loaded_element, pageNum-1);
            $("#page-num").text(pageNum-1);
          }
        }
        else{
          var tableBody = $("#favorites-tbody");
          var iTABLE = "";
          for (let i = 0; i < result.length; i++) {
              iTABLE += "<tr> ";
              iTABLE += "<td class='row-id'>" + (i+1) + "</td>";
              iTABLE += "<td class ='favorite-name-cell'>" + result[i]['name']+ "</td>";
              iTABLE += "<td id='favorites-buttons'>" + 
              "<button type='button' class='btn favorites-addcollection-button' value='"+result[i]['name']+ "-" +result[i]['placeId']+"'>Add to Collection</button>" +
              "<button type='button' class='btn favorites-delete-button' value='"+result[i]['name']+ "-" +result[i]['favoritesId']+"'>Delete</button>"+ 
              "</td>";
              iTABLE += "</tr> ";
          }
          tableBody.html(iTABLE);
        }
      },
      error: function (request, msg, error) {}
    });
  }
}