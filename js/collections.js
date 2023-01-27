/**
 * This file contains the functionality for user profile - collections section
 * It manages all the collections api calls and evet handlers
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

    //COLLECTION TABLE PAGINATION
    // previouse page click
    $("#prev-link").on('click', function(){
        pageNum = $("#page-num").val();
        if(pageNum > 1){
            pageNum--;
        }
        else{
            pageNum = 1;
        }
        get_user_collections(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    });

    // next page click 
    $("#next-link").on('click', function(){
        pageNum ++;
        get_user_collections(api, token, user_id, loaded_element, pageNum);
        $("#page-num").text(pageNum);
    });

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        // a function to load user reviews data
        get_user_collections(api, token, user_id, loaded_element, pageNum);
    }, 100);

    // collection name click event
    $(document).on("click", ".collectionName", function (e) {
        e.stopImmediatePropagation();

        //get collection name
        let coll_name = e['target']['innerText'];
        //redirection to colection items page
        $("#user-profile-content").load("../html/collection.html");
        
        //give time for collection items to be loaded, then display the collection name
        setTimeout(function(){
            pageNum = 1;
            $("#page-num").text(pageNum);
            $("h1#collection-name").text(coll_name);
            get_user_collection_item(api, token, user_id, pageNum, coll_name);
        }, 10);
    });


    //add to favorites button for collection items
    $(document).on("click", ".collection-addfavorite-button", function (e) {
        e.stopImmediatePropagation();

        // get the place id and place name
        let place_val = $(this).val().split("-")[0];
        let id_val = $(this).val().split("-")[1];
        
        // POST call to add the collection item to favorites
        $.ajax({
            url: api.post_to_favorites,
            method: 'POST',
            mode: 'cors',
            data: JSON.stringify({"placeId": parseInt(id_val), "userId": parseInt(user_id), "Name": place_val}),
            contentType: 'application/json',
            success: function(result) {
                $("#favorites-message").text(place_val + " successfully added to favorites.");
            },
            // handle errors
            error: function(request,msg,error) {}
        });
    });

    // create a collection event handler
    $(document).on("click", "#create-collection-button", function (e) {
        e.preventDefault();
        
        //get the new collection name
        let new_coll_name = $("#create-collection-input").val();
        
        if(new_coll_name !== ''){
            //POST call to create the new collection
            $.ajax({
                url: api.post_to_collection,
                method: 'POST',
                mode: 'cors',
                data: JSON.stringify({"userId": parseInt(user_id),"name": new_coll_name}),
                contentType: 'application/json',
                success: function(result) {
                    $("p#error-message").text("");
                    //reload the collection section of user profile
                    $("#user-profile-content").load("../html/collections.html");   
                    $.getScript("../js/collections.js");
                },
                // handle errors
                error: function() {
                    $("p#error-message").text("Something went wrong while creating the collection!");
                }
            });
        }
        else{
            $("p#error-message").text("Empty collection name, please check before creating!");
        }
       
    });


    //delete collection event handler
    $(document).on("click", ".collection-delete-btn", function (e) {
        e.stopImmediatePropagation();

        //get the collection name
        let del_col_name = $(this).val();
        
        //confirm if the user wants to delete the collection
        $.confirm({
            title: 'Delete!',
            content: 'Are you sure want to delete '+ del_col_name + ' collection?',
            buttons: {
                confirm: function () {
                    //DELETE call to delete the collections and items as well
                    $.ajax({
                        url: api.delete_collection_by_userid_collectionname + user_id + '&collectionName=' + del_col_name,
                        method: 'DELETE',
                        mode: 'cors',
                        contentType: 'application/json',
                        headers: { Authorization: 'Bearer ' + token },
                        success: function (result) {
                            $.alert('Deleted!');
                            // reload the collection section of user profile
                            $("#user-profile-content").load("../html/collections.html");   
                            $.getScript("../js/collections.js");
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


    // collection item delete event handler
    $(document).on("click", ".collection-item-delete-button", function (e) {
        e.stopImmediatePropagation();

        // get the collection item name
        let del_col_item = $(this).val().split("-");

        //confirm if the user wants to delete the collection item
        $.confirm({
            title: 'Delete!',
            content: 'Are you sure want to delete '+ del_col_item[1] + ' from this collection?',
            buttons: {
            confirm: function () {
                //DELETE call to delete the collections item
                $.ajax({
                    url: api.delete_collection_item_by_collectionid + del_col_item[0],
                    method: 'DELETE',
                    mode: 'cors',
                    contentType: 'application/json',
                    headers: { Authorization: 'Bearer ' + token },
                    success: function (result) {
                        $.alert('Deleted!');
                        // reload the collection section of user profile
                        $("#user-profile-content").load("../html/collections.html");   
                        $.getScript("../js/collections.js");
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
});

/**
 * This function will load user collection into an html table
 * @param {*} api : api list
 * @param {*} token : token value
 * @param {*} user_id : user id
 * @param {*} loaded_element : loaded element type
 * @param {*} pageNum : page number
 */
function get_user_collections(api, token, user_id, loaded_element, pageNum){

    // check the element type that is required to load in user profile
    if(loaded_element === "collections"){
        
        //GET call to etreive user's collections
        $.ajax({
            url: api.get_collections_by_userid + user_id + "?pageNum=" + pageNum,
            method: 'GET',
            mode: 'cors',
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            success: function (result) {
                
                //display the reviews in a table
                if(result.length === 0){
                    pageNum --;
                    if(pageNum > 1){
                        get_user_collections(api, token, user_id, loaded_element, pageNum-1);
                        $("#page-num").text(pageNum-1);
                    }
                }
                else{
                    var new_result = []
                    // get the collection item's that don't have a place id = 0
                    for (let x = 0; x < result.length; x++) {
                        new_result.push(result[x]);
                    }

                    // group the collections by collection name
                    let result_filters = new_result.reduce( (acc, o) => (acc[o.name] = (acc[o.name] || 0)+1, acc), {} );

                    // display the collections in a table
                    var tableBody = $("#collections-tbody");
                    var iTABLE = "";
                    var i = 0;
                    for (const property in result_filters) {
                        iTABLE += "<tr> ";
                        iTABLE += "<td class='row-id'>" + (i+1) + "</td>";
                        iTABLE += "<td><a href='#' class='collectionName' value='"+property+"'>" + (property) + "</a></td>";
                        iTABLE += "<td>" + (result_filters[property]-1)+ "</td>";
                        iTABLE += "<td class='collection-delete-col'>" + 
                        "<button type='button' class='btn collection-delete-btn' value='"+property+"'>Delete</button>"+ 
                        "</td>";
                        iTABLE += "</tr> ";
                        i++;
                    }
                    tableBody.html(iTABLE);
                }
            },
            error: function (request, msg, error) {
            }
        });
    }
}

function get_user_collection_item(api, token, user_id, pageNum, coll_name){
    // GET call to get the collection items by collection name
    $.ajax({
        url: api.get_collection_by_userid_collectionname + user_id +'&collectionName='+ coll_name + "&pageNum=" + pageNum,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            
            if(result.length === 0){
                pageNum--;
                if(pageNum > 1){
                    get_user_collection_item(api, token, user_id, pageNum-1, coll_name);
                    $("#page-num").text(pageNum-1);
                }
            }
            else{
                var new_result = []

                // get the collection item's that don't have a place id = 0
                for (let x = 0; x < result.length; x++) {
                    if(result[x]['placeId'] !== 0){
                        new_result.push(result[x]);
                    }
                }

                // display the collections items in a table
                var tableBody = $("#collection-tbody");
                var iTABLE = "";
                for (let i = 0; i < new_result.length; i++) {
                    
                    iTABLE += "<tr> ";
                    iTABLE += "<td class='row-id'>" + (i+1) + "</td>";
                    iTABLE += "<td class ='collection-name-cell'>" + new_result[i]['placeName']+ "</td>";
                    iTABLE += "<td id='favorites-buttons'>" + 
                    "<button type='button' class='btn collection-addfavorite-button' value='"+new_result[i]['placeName']+'-'+new_result[i]['placeId'] +"'>Add to Favorits</button>" +
                    "<button type='button' class='btn collection-item-delete-button' value='"+new_result[i]['collectionId']+ "-" +new_result[i]['placeName']+"'>Delete</button>"+ 
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