$(document).ready(function(e){ 
    //get the token from local storage
    let token = localStorage.getItem('token');
    //get upload excel file input
    const excel_file = document.getElementById('excel_file');
    
    // array to store all the api links from global.json
    var api = [];
    $.getJSON('../js/global.json', function(json) {api = json}); 

    // display table pagination
    let pageNum = 1;
    $("#page-num").text(pageNum);

    // previouse page click
    $("#prev-link").on('click', function(e){
        e.preventDefault();
        let selected_opt = $("#places-dropdown option:selected").text();
        
        pageNum = $("#page-num").text();
        if(pageNum > 1){
            pageNum--;
        }
        else{
            pageNum = 1;
        }
        $("#page-num").text(pageNum);
        
        if(selected_opt === "Continents"){
            get_continent_data(api, token, pageNum);
        }
        if(selected_opt === "Countries"){
            get_country_data(api, token, pageNum);
        }
        else if (selected_opt === "Cities"){
            get_city_data(api, token, pageNum);
        }
    });

    // next page click 
    $("#next-link").on('click', function(e){
        e.preventDefault();
        let selected_opt = $("#places-dropdown option:selected").text();
        
        pageNum ++;
        $("#page-num").text(pageNum);

        if(selected_opt === "Continents"){
            get_continent_data(api, token, pageNum);
        }
        if(selected_opt === "Countries"){
            get_country_data(api, token, pageNum);
        }
        else if (selected_opt === "Cities"){
            get_city_data(api, token, pageNum);
        }
    });

    //change event on uploading the places management data
    $("#upload-data" ).on('click', function(e) {
        e.stopImmediatePropagation();
        let selected_opt = $("#places-dropdown option:selected").text();

        //check selected option and get the required data
        if(selected_opt === "Continents"){
            $(".managementTitle").text("Continents Data Management");
            $(".add-new-place" ).remove();
            $("div#upload-data-div").append("<button type='button' class='btn add-new-place'>Add new Continent</button>"); 

            get_continent_data(api, token, pageNum);
        }
        if(selected_opt === "Countries"){
            $(".managementTitle").text("Countries Data Management");
            $(".add-new-place" ).remove();
            $("div#upload-data-div").append("<button type='button' class='btn add-new-place'>Add new Country</button>");

            get_country_data(api, token, pageNum);
        }
        else if (selected_opt === "Cities"){
            $(".managementTitle").text("Cities Data Management"); 
            $(".add-new-place" ).remove();
            $("div#upload-data-div").append("<button type='button' class='btn add-new-place'>Add new City</button>");

            get_city_data(api, token, pageNum);
        }
    });
    
    
    //add new place button click handler 
    $(document).on("click", ".add-new-place", function(){
       
        //get selected option and set it in local storage
        let selected_opt = $("#places-dropdown option:selected").text();
        localStorage.setItem("selected_opt", selected_opt);
        //set the button clicked type in local storage
        localStorage.setItem("button_clicked_type", "new");

        //redirect to edit place form page
        window.location.href="../html/editPlace.html";
    });

    //edit button click handler
    $(document).on("click", ".management-edit-button", function (e) {
        e.stopImmediatePropagation();

        //get selected option 
        let selected_opt = $("#places-dropdown option:selected").text();
        //get the place id
        let place_id = parseInt($(this).val());

        //set the place id, selected option, and button clicked type in local storage
        localStorage.setItem("place_id", place_id);
        localStorage.setItem("selected_opt", selected_opt);
        localStorage.setItem("button_clicked_type", "edit");

        //redirect to edit place form page
        window.location.href="../html/editPlace.html";
    });


    //delete button click handler 
    $(document).on("click", ".management-delete-button", function (e) {
        e.stopImmediatePropagation();
        //get place id ,name and selected option
        let place_id = parseInt($(this).val().split("-")[0]);
        let place_name = $(this).val().split("-")[1];
        let selected_opt = $("#places-dropdown option:selected").text();

        //sheck the selected option
        if(selected_opt === "Continents"){
            //confirm if the user wants to delete the place
            $.confirm({
                title: 'Delete!',
                content: 'Are you sure want to delete '+ place_name + '?',
                buttons: {
                    confirm: function () {
                        //DELETE call to delete the place 
                        $.ajax({
                            url: api.delete_contienent_by_id + place_id,
                            method: 'DELETE',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function () {
                                $("#error_message").text("");
                                location.reload();
                            },
                            error: function () {
                                $("#error_message").text("Something went wrong while deleting continent data");
                            }
                        });
                    },
                    cancel: function () {
                    $.alert('Canceled!');
                    }
                }   
            });
        }
        else if(selected_opt === "Countries"){
            //confirm if the user wants to delete the place
            $.confirm({
                title: 'Delete!',
                content: 'Are you sure want to delete '+ place_name + '?',
                buttons: {
                    confirm: function () {
                        //DELETE call to delete the place
                        $.ajax({
                            url: api.delete_country_by_id + place_id,
                            method: 'DELETE',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function () {
                                $("#error_message").text("");
                                location.reload();
                            },
                            error: function () {
                                $("#error_message").text("Something went wrong while deleting country data");
                            }
                        });
                    },
                    cancel: function () {
                    $.alert('Canceled!');
                    }
                }   
            });
            
        }
        else{
            //confirm if the user wants to delete the place
            $.confirm({
                title: 'Delete!',
                content: 'Are you sure want to delete '+ place_name + '?',
                buttons: {
                    confirm: function () {
                        //DELETE call to delete the place
                        $.ajax({
                            url: api.delete_city_by_id + place_id,
                            method: 'DELETE',
                            mode: 'cors',
                            contentType: 'application/json',
                            headers: { Authorization: 'Bearer ' + token },
                            success: function () {
                                $("#error_message").text("");
                                location.reload();
                            },
                            error: function () {
                                $("#error_message").text("Something went wrong while deleting city data");
                            }
                        });
                    },
                    cancel: function () {
                    $.alert('Canceled!');
                    }
                }   
            });
        }
    });
});


function get_continent_data(api, token, pageNum){
    $.ajax({
        url: api.get_paginated_continents + pageNum,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            $("#error_message").text("");
            data = JSON.parse(result); 

            if(data.length === 0){
                pageNum --;
                if(pageNum > 1){
                    get_continent_data(api, token, pageNum-1);
                    $("#page-num").text(pageNum-1);
                }
            }
            else{
                loadData(JSON.parse(result));
            }
        },
        error: function () {
            $("#error_message").text("Something went wrong while uploading continent data");
        }
    });
}


function get_country_data(api, token, pageNum){
    $.ajax({
        url: api.get_paginated_countries + pageNum,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            $("#error_message").text("");
            data = JSON.parse(result); 
            
            if(data.length === 0){
                pageNum --;
                if(pageNum > 1){
                    get_country_data(api, token, pageNum-1);
                    $("#page-num").text(pageNum-1);
                }
            }
            else{
                loadData(JSON.parse(result));
            }
        },
        error: function () {
            $("#error_message").text("Something went wrong while uploading country data");
        }
    });
}


function get_city_data(api, token, pageNum){
    $.ajax({
        url: api.get_paginated_cities + pageNum,
        method: 'GET',
        mode: 'cors',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        success: function (result) {
            $("#error_message").text("");
            data = JSON.parse(result); 

            if(data.length === 0){
                pageNum --;
                if(pageNum > 1){
                    get_city_data(api, token, pageNum-1);
                    $("#page-num").text(pageNum-1);
                }
            }
            else{
                loadData(JSON.parse(result));
            }
        },
        error: function () {
            $("#error_message").text("Something went wrong while uploading city data");
        }
    });
}


/**
 * This function load the data from the excel sheets to the html table 
 * @param {*} data : place data 
 */
function loadData(data){
    //display data in the html table
    var tableBody = $("#data-management-tbody");
    var iTABLE = "";
    for (let i = 0; i < data.length; i++) {
        if(data[i][1] !== undefined){
            iTABLE += "<tr> ";
            iTABLE += "<td>" + (i+1) + "</td>";
            iTABLE += "<td class = 'data-col'>" + data[i][1]+ "</td>";
            iTABLE += "<td><button type='button' class='btn management-edit-button' value='"+data[i][0]+"'>Edit</button>" +
            "<button type='button' class='btn management-delete-button' value='"+data[i][0] + "-" +data[i][1]+"'>Delete</button></td>";
            iTABLE += "</tr> ";
        }
    }
    tableBody.html(iTABLE);
}