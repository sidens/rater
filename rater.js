$(function() {
//Create map of results to be returned from query
var resultsmap = {};
//Create regions to pick from
var regions = 
{ 
  Seattle:
  [
    "https://data.kingcounty.gov/resource/gkhn-e8mn.json", //url
    "name", //dataset value for name
    "business_id", //dataset value for business id
    "grade", //dataset value for grade
    "IS NOT NULL", //where params
    "", //scale
    {1:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/excellent_50.gif", 2:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/good_50.gif", 3:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/okay_50.gif", 4:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/needstoimprove_50.gif"}
  ],
  
  NYC:
  [
    "https://data.cityofnewyork.us/resource/9w7m-hzhe.json", //url
    "DBA", //dataset value for name
    "CAMIS", //dataset value for business id
    "GRADE", //dataset value for grade
    "IS NOT NULL", //where params
    "", //scale
    {A:"img/NYC/a.png", B:"img/NYC/b.png", C:"img/NYC/c.png", P:"img/NYC/p.png"}
  ]
};
//var ratings = ["http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/excellent_50.gif", "http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/good_50.gif", "http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/okay_50.gif", "http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/needstoimprove_50.gif"];

// Excute this function when form is submitted
  $("#search").submit(function(event) {
    //Prevent default submit, clear list in UI, and empty results map
    event.preventDefault();
    resultsmap = {};
    $( "#rest_grades" ).empty();
    
    //Find search parameters
    var search = $("#search .query").val();
    var region = $("#search #city").val();
    //console.log("region: "+region);

    //Pick region for data based on user input
    var userregion = regions[region];

    // //Get dataset address
    // var datasetaddress = userregion[0];

    //Build query parameters
    var selectquery = userregion[1]+", "+userregion[2]+", "+userregion[3];
    console.log(selectquery);
    var wherequery = userregion[3]+" "+userregion[4];
    console.log(wherequery);


    $.ajax({
    url: userregion[0],
    type: "GET",
    data: {
      "$select" : selectquery ,
      "$where": wherequery, 
      "$q": search,
      "$limit" : 50000,
      "$$app_token" : "CE7uCoAw5PG2KLRXRhRTCaIaM"
    }
    }).done(function(listings) {
        //Set fieldnames for each dataset
        var namefield = userregion[1];
        var businessidfield = userregion[2];
        var gradefield = userregion[3];
        var ratings = userregion[6];

        //console.log(namefield);  

        $.each(listings, function(idx, listing) {
          // Fetch each resturaunt listing  
          
          //set universal params based on listing entries
          // console.log(JSON.stringify(listing));  
          var name = listing[namefield];
          var grade = listing[gradefield];
          var businessid = listing[businessidfield];
          
          console.log(name);

          //add Businesses to the results map
          resultsmap[businessid] = {name, grade};
          //console.log(JSON.stringify(resultsmap[businessid]));  

        });
        // console.log("results map:");
        // console.log(resultsmap);
        // console.log(resultsmap.length);

        $.each(resultsmap, function(idx, result) {
           // console.log("map entry:");
           // console.log(result.name);
           // console.log("index:" + idx);

        //results html, with ratings as key, converting to image
          var resultgrade = result.grade;
          console.log("Grade for result: "+resultgrade);
          console.log("Img for result: "+ratings[resultgrade]);

          $( "#rest_grades" ).append( "<span>Name: "+result.name+"</span>&nbsp;<span>Rating: <img width=50 src=\""+ratings[resultgrade]+"\" /></span><br/>");
        //$( "#rest_grades" ).append( "<span>Name: "+result.name+"</span>&nbsp;<span>Rating: "+result.grade+"</span><br/>");
        });
    });
    // }).done(function(data) {
    //   alert("Name: " + search + " \n Retrieved " + data.length + " records from the dataset!");
    //   console.log(data);
    // });
  });
});

/*
      $.ajax({
        url: "https://data.sfgov.org/resource/6a9r-agq8.json",
        type: "GET",
        data: {
          "status" : "APPROVED",
          "$where": "expirationdate > '" + (new Date()).toISOString().replace(/Z/, '') + "'" 
            + " AND within_circle(location, "
            + pos.coords.latitude + ", "
            + pos.coords.longitude + ", 500)",
          "$q": search,
          "$select": "*, distance_in_meters(location, 'POINT(" + pos.coords.longitude + " " + pos.coords.latitude + ")') AS range",
          "$order" : "range",
          "$limit" : 5,
          "$$app_token": "CGxaHQoQlgQSev4zyUh5aR5J3"
        }
      }).done(function(listings
) {
        $.each(listings
, function(idx, listing) {
          // Fetch the nearest trees to each listing
          $.ajax({
            url: "https://data.sfgov.org/resource/2zah-tuvt.json",
            type: "GET",
            data: {
              "$select": "min(distance_in_meters(location, 'POINT(" + listing.location.coordinates.join(" ") + ")')) as distance",
              "$$app_token": "CGxaHQoQlgQSev4zyUh5aR5J3"
            },
          }).done(function(closest_tree) {
            // Add a marker for the location of the food listing
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(listing.location.coordinates[1],
                            listing.location.coordinates[0]),
              map: map,
              animation: google.maps.Animation.DROP,
              icon: "./img/foodlisting.png",
              title: listing.applicant,
              optimized: false
            });

            // Add an InfoWindow with details about the listing
            var info_window = new google.maps.InfoWindow({
              content: '<div class="info-window">'
                + '<h4>' + listing.applicant + '</h4>'
                + '<h5>' + Math.round(parseFloat(listing.range)) + ' meters away.</h5>'
                + '<p>' + listing.fooditems + '</p>'
                + '<p>Nearest tree is within <em>' + Math.round(parseFloat(closest_tree[0].distance)) + ' meters</em>.</p>'
                + '</div>'
            });
            google.maps.event.addListener(marker, 'click', function() {
              info_window.open(map, marker);
            });

            // Add a circle to show how far you'd have to walk for a tree
            var circle = new google.maps.Circle({
              strokeOpacity: 0.0,
              fillColor: "#00FF00",
              fillOpacity: 0.2,
              map: map,
              radius: parseFloat(closest_tree[0].distance),
              center: new google.maps.LatLng(listing.location.coordinates[1],
                  listing.location.coordinates[0])
            });
          });
        });
      });
    })
    */