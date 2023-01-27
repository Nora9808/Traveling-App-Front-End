$(document).ready(function(e){

    //get the token, clicked button type, place id and selected option
    let token = localStorage.getItem('token');
    let button_clicked_type = localStorage.getItem("button_clicked_type");
    let place_id = localStorage.getItem("place_id");
    let selected_opt = localStorage.getItem("selected_opt");
    //result arrayto stroe the place details
    var result_data = [];

    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json}); 

    //display the selected option
    $(".placeTitle").text(selected_opt);

    /**
     * set timeout to 100 milisecond to make sure the api links are
     * completly loaded before any ajax call
    */
    setTimeout(function(){
        //check the clicked button type
        if(button_clicked_type === "edit"){
        
                //check the selected option
                if(selected_opt === "Continents"){
                    $("#countries-dp").hide();
                    $("#continents-dp").hide();

                    setTimeout(function(){
                        //GET call to get the place details byplace id
                        $.ajax({
                            url: api.get_continent_by_id + place_id,
                            method: 'GET',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function (result) {
                                $("#error_message").text("");
                                result_data = result;
                                //display the data in html form
                                $("#place-name-h1").text(result["continentName"]);
                                $("#place-input").val(result["continentName"]);
                                $("#description-textarea").text(result["description"])
                            },
                            error: function () {
                                $("#error_message").text("Something went wrong while loading continent data");
                            }
                        });
                    }, 100);
                }
                else if (selected_opt === "Countries"){
                    $("#countries-dp").hide();
                    $("#continents-dp").show();
                    
                    //GET call to get the place details byplace id
                    setTimeout(function(){
                        load_continent_data(api, token);

                        $.ajax({
                            url: api.get_country_by_id + place_id,
                            method: 'GET',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function (result) {
                                $("#error_message").text("");

                                result_data = result;
                                //display the data in html form
                                $("#place-name-h1").text(result["countryName"]);
                                $("#place-input").val(result["countryName"]);
                                $("#description-textarea").text(result["description"]);
                                $("#continents-dp option[value="+ result["continentId"] +"]").prop('selected', true);
                            },
                            error: function () {
                                $("#error_message").text("Something went wrong while loading country data");
                            }
                        });
                    }, 100);
                }
                else{
                    $("#countries-dp").show();
                    $("#continents-dp").show();

                    setTimeout(function(){
                        //function to load the data in the html dropdown
                        load_continent_data(api, token);
                        load_country_data(api, token);

                        //GET call to get the place details byplace id
                        $.ajax({
                            url: api.get_city_by_id + place_id,
                            method: 'GET',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function (result) {
                                $("#error_message").text("");
                                result_data = result;
                                console.log(result);
                                //display the data in html form
                                $("#place-name-h1").text(result["cityName"]);
                                $("#place-input").val(result["cityName"]);
                                $("#description-textarea").text(result["description"])
                                $("#continents-dp option[value="+ result["continentId"] +"]").prop('selected', true);
                                $("#countries-dp option[value="+ result["countryId"] +"]").prop('selected', true);
                            },
                            error: function () {
                                $("#error_message").text("Something went wrong while loading city data");
                            }
                        });
                    }, 100);
                }

                //display edit button
                $("div#main-content").append("<button type='button' class='btn' id='data-edit-button'>Edit</button>");
        }
        //if the clicked button type is new
        else{
        
            //check the selected option
            if(selected_opt === "Continents"){
                $("#countries-dp").hide();
                $("#continents-dp").hide();
            }
            else if(selected_opt === "Countries"){
                $("#countries-dp").hide();
                $("#continents-dp").show();
                load_continent_data(api, token);
            }
            else if(selected_opt === "Cities"){
                $("#countries-dp").show();
                $("#continents-dp").show();

                //function to load the data in the html dropdown
                load_continent_data(api, token);
                load_country_data(api, token);
            }
            //display add new button
            $("div#main-content").append("<button type='button' class='btn' id='data-new-button'>Add</button>");
            
        }
    }, 10);


    $(document).on("click", "#data-edit-button", function (e) {
        e.stopImmediatePropagation();
        
        if(selected_opt === "Continents"){
            console.log($("#place-input").val())
            
            $.ajax({
                url: api.put_continent_by_id + place_id,
                method: 'PUT',
                mode: 'cors',
                // set the json data that will be sent to backend to update user data
                data: JSON.stringify({
                "continentId": parseInt(place_id),
                "continentName":  $("#place-input").val(), 
                "description": $("#description-textarea").val(), 
                "dateCreated": result_data["dateCreated"]
            }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function (result) {
                    $("#error_message").text("");
                    // reload the page
                    window.location.href="../html/editPlace.html";
                    result_data = result;
                },
                error: function () {
                    $("#error_message").text("Something went wrong while updating continent data");
                }
            });// end of request
        }
        else  if(selected_opt === "Countries"){
            let con_selected_opt = $("#continents-dp option:selected").val();

            $.ajax({
                url: api.put_country_by_id + place_id,
                method: 'PUT',
                mode: 'cors',
                // set the json data that will be sent to backend to update user data
                data: JSON.stringify({
                "countryId": parseInt(place_id),
                "continentId": parseInt(con_selected_opt),
                "countryName":  $("#place-input").val(), 
                "description": $("#description-textarea").val(), 
                "dateCreated": result_data["dateCreated"]
            }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function (result) {
                    $("#error_message").text("");
                    // reload the page
                    window.location.href="../html/editPlace.html";
                    result_data = result;
                },
                error: function () {
                    $("#error_message").text("Something went wrong while updating country data");
                }
            });// end of request
        }
        else{
            let con_selected_opt = $("#continents-dp option:selected").val();
            let cou_selected_opt = $("#countries-dp option:selected").val();

            $.ajax({
                url: api.put_city_by_id + place_id,
                method: 'PUT',
                mode: 'cors',
                // set the json data that will be sent to backend to update user data
                data: JSON.stringify({
                "cityId" : parseInt(place_id),
                "continentId": parseInt(con_selected_opt),
                "countryId": parseInt(cou_selected_opt),
                "cityName":  $("#place-input").val(), 
                "description": $("#description-textarea").val(), 
                "dateCreated": result_data["dateCreated"]
            }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function (result) {
                    $("#error_message").text("");
                    // reload the page
                    window.location.href="../html/editPlace.html";
                    result_data = result;
                },
                error: function () {
                    $("#error_message").text("Something went wrong while updating city data");
                }
            });// end of request
        }
    });



    //add new button click handler
    $(document).on("click", "#data-new-button", function(e){
        e.stopImmediatePropagation();
        //check the sleected option
        if(selected_opt === "Continents"){
            //POST call to add the new place
            $.ajax({
                url: api.post_new_continent,
                method: 'POST',
                mode: 'cors',
                data: JSON.stringify({
                  "continentName": $("#place-input").val(),
                  "description": $("#description-textarea").val()
                }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function () {
                    $("#error_message").text(""); 
                    //redirect to data management page
                    window.location.href="../html/management.html";
                },
                error: function () {
                    $("#error_message").text("Something went wrong while adding new continent data");
                }
            });
        }
        else  if(selected_opt === "Countries"){
            //get selected continent
            let con_selected_opt = $("#continents-dp option:selected").val();
             //POST call to add the new place
            $.ajax({
                url: api.post_new_country,
                method: 'POST',
                mode: 'cors',
                data: JSON.stringify({
                  "continentId": parseInt(con_selected_opt),
                  "countryName": $("#place-input").val(),
                  "description": $("#description-textarea").val()
                }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function () {
                    $("#error_message").text(""); 
                    //redirect to data management page
                    window.location.href="../html/management.html";
                },
                error: function () {
                    $("#error_message").text("Something went wrong while adding continent data");
                }
            });
        }
        else{
            //get the selected continent and country options
            let con_selected_opt = $("#continents-dp option:selected").val();
            let cou_selected_opt = $("#countries-dp option:selected").val();
             //POST call to add the new place
            $.ajax({
                url: api.post_new_city,
                method: 'POST',
                mode: 'cors',
                data: JSON.stringify({
                  "continentId": parseInt(con_selected_opt),
                  "countryId": parseInt(cou_selected_opt),
                  "cityName": $("#place-input").val(),
                  "description": $("#description-textarea").val()
                }),
                contentType: 'application/json',
                headers: { Authorization: 'Bearer ' + token },
                success: function () { 
                    $("#error_message").text("");
                    //redirect to data management page
                    window.location.href="../html/management.html";
                },
                error: function () {
                    $("#error_message").text("Something went wrong while adding new data");
                }
            });
        }
    });
});


/**
 * this function will load the continent names into the dropdown element
 * @param {*} api : api list
 * @param {*} token : token value
 */
function load_continent_data(api, token){
    //GET call to get all the continents data
    $.ajax({
        url: api.get_all_continents,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            $("#error_message").text("");
            //loop through the data and display the continent names in the dropdown
            for(let x = 0; x < result.length; x++){
                $("#continents-dp").append("<option value='"+ result[x]["continentId"] +"'>" + result[x]["continentId"] + " - " + result[x]["continentName"] + "</option>");
            }
        },
        error: function () {
            $("#error_message").text("Something went wrong while loading continent data in the dropdown");
        }
    });
}

/**
 * this function will load the country data into the dropdown element
 * @param {*} api : api list
 * @param {*} token : token value
 */
function load_country_data(api, token){
    //GET call to get all the countries data
    $.ajax({
        url: api.get_all_countries,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {

            $("#error_message").text("");
            //loop through the data and display the countries names in the dropdown
            for(let x = 0; x < result.length; x++){
                if(result[x]["countryId"] !== undefined){
                    $("#countries-dp").append("<option value='"+ result[x]["countryId"] +"'>" + result[x]["countryId"] + " - " + result[x]["countryName"] + "</option>");
                }
            }
        },
        error: function () {
            $("#error_message").text("Something went wrong while loading country data in the dropdown");
        }
    });
}