$(function() {
var resultsmap = {};
var ratings = ["http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/excellent_50.gif", "http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/good_50.gif", "http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/okay_50.gif", "http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/needstoimprove_50.gif"];
  $("#search").submit(function(event) {
    event.preventDefault();
    $( "#rest_grades" ).empty();
    resultsmap = {};
    
    var search = $("#search .query").val();

    $.ajax({
    url: "https://data.kingcounty.gov/resource/gkhn-e8mn.json",
    type: "GET",
    data: {
      "$select" : "name, business_id, grade",
      "$where": "grade IS NOT NULL", 
      "$q": search,
      "$limit" : 50000,
      "$$app_token" : "CE7uCoAw5PG2KLRXRhRTCaIaM"
    }
    }).done(function(listings) {
        $.each(listings, function(idx, listing) {
          // Fetch each resturaunt listing   
          var name = listing.name;
          var grade = listing.grade;
          var business_id = listing.business_id;
          // console.log(name);   
          // console.log(grade);
          resultsmap[business_id] = {name, grade};
        });
        console.log("results map:");
        console.log(resultsmap);
        console.log(resultsmap.length);

        $.each(resultsmap, function(idx, result) {
          console.log("map entry:");
          console.log(result.name);
          // console.log("index:" + idx);
          $( "#rest_grades" ).append( "<span>Name: "+result.name+"</span>&nbsp;<span>Rating: "+result.grade+"</span>&nbsp;<img src=\""+ratings[result.grade-1]+"\" /><br/>");
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