$(function() {

//Check localstorage to see if city has been set previously
if(localStorage.getItem("city")){
 $("#city").val(localStorage.getItem("city"))
}

//Create map of results to be returned from query
var resultsmap = {};
//Create regions to pick from
var regions = 
{ 
  SEA:
  [
    "https://data.kingcounty.gov/resource/gkhn-e8mn.json", //url
    "name", //dataset value for name
    "business_id", //dataset value for business id
    "grade", //dataset value for grade
    "IS NOT NULL", //where params
    {1:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/excellent_50.gif", 2:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/good_50.gif", 3:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/okay_50.gif", 4:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/needstoimprove_50.gif"}, //rating images
    "http://www.kingcounty.gov/depts/health/environmental-health/food-safety/inspection-system/~/media/depts/health/environmental-health/images/food-safety/food-safety-ratings-emoji.ashx", //scale image
    "http://www.kingcounty.gov/depts/health/environmental-health/food-safety/inspection-system/food-safety-rating.aspx", //more details from authority
    "https://data.kingcounty.gov/Health/Food-Establishment-Inspection-Data/f29f-zza5", //attribution
    "ADDRESS" //dataset value for street number & address

  ],
  
  NYC:
  [
    "https://data.cityofnewyork.us/resource/9w7m-hzhe.json", //url
    "DBA", //dataset value for name
    "CAMIS", //dataset value for business id
    "GRADE", //dataset value for grade
    "IS NOT NULL", //where params
    {"A":"img/NYC/a.png", "B":"img/NYC/b.png", "C":"img/NYC/c.png", "P":"img/NYC/p.png", "Z":"img/NYC/p.png", "Not Yet Graded":"img/NYC/notyetrated.png"}, //rating images
    "img/NYC/nyc-scale.png", //scale image
    "https://www1.nyc.gov/assets/doh/downloads/pdf/rii/inspection-cycle-overview.pdf", //more details from authority
    "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j", //attribution
    "STREET" //dataset value for address
  ]
  // ,
  // SFO:
  // [
  //   "https://data.sfgov.org/resource/sipz-fjte.json", //url
  //   "business_name", //dataset value for name
  //   "business_id", //dataset value for business id
  //   "inspection_score", //dataset value for grade
  //   "IS NOT NULL", //where params
  //   {1:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/excellent_50.gif", 2:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/good_50.gif", 3:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/okay_50.gif", 4:"http://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/needstoimprove_50.gif"}, //rating images
  //   "http://www.kingcounty.gov/depts/health/environmental-health/food-safety/inspection-system/~/media/depts/health/environmental-health/images/food-safety/food-safety-ratings-emoji.ashx", //scale image
  //   "https://www.sfdph.org/dph/EH/Food/Score/", //more details from authority
  //   "https://data.sfgov.org/Health-and-Social-Services/Restaurant-Scores-LIVES-Standard/pyih-qa8i" //attribution
  // ],
};

// Excute this function when form is submitted
  $("#search").submit(function(event) {
    //Prevent default submit, clear list in UI, and empty results map
    event.preventDefault();
    resultsmap = {};
    $( "#rest_grades" ).empty();
    $( "#scale" ).empty();
    $( "#results_wrapper").show()
    
    //Find search parameters
    var search = $("#search .query").val();
    var region = $("#search #city").val();

    //Set city in localstorage for next time
    localStorage.setItem("city", region); 

    //console.log("region: "+region);

    //Pick region for data based on user input
    var userregion = regions[region];

    // //Get dataset address
    // var datasetaddress = userregion[0];

    //Build query parameters
    var selectquery = userregion[1]+", "+userregion[2]+", "+userregion[3]+", "+userregion[9];
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
        var ratings = userregion[5];
        var scale = userregion[6];
        var scaledetails = userregion[7];
        var attribution = userregion[8];
        var addressfield = userregion[9];

        //setup scale
        $( "#scale" ).append( "<div id=\"ratingdetails\"><a href=\""+scaledetails+"\" target=\"_blank\"><h2>"+region+"'s Rating Scale</h2></a><br/><span id=\"scale\"><img width=80% src=\""+scale+"\" /></span></div>");
        $( "#scale" ).append( "<div id=\"attribution\"><a href=\""+attribution+"\" target=\"_blank\">Open Data Source</a></div><br/>");

        //setup table
        $( "#rest_grades"  ).append( "<table id=\"resultslist\" align=\"center\"><thead><tr><th>Name</th><th>Address</th><th>Rating</th></tr></thead><tbody>" );
        
        //console.log(namefield);  

        $.each(listings, function(idx, listing) {
          // Fetch each resturaunt listing  
          
          //set universal params based on listing entries
          // console.log(JSON.stringify(listing));  
          var name = listing[namefield];
          var grade = listing[gradefield];
          var businessid = listing[businessidfield];
          var address = listing[addressfield];
          
         //console.log(name);

          //add Businesses to the results map
          resultsmap[businessid] = {name, grade, address};
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
          // console.log("Grade for result: "+resultgrade);
          // console.log("Img for result: "+ratings[resultgrade]);
          var newrow = "<tr><td>"+result.name+"</td><td>"+result.address+"</td><td><img width=50 src=\""+ratings[resultgrade]+"\" /></td>/tr>";
          $("#resultslist tbody").append(newrow);

          //$( "#rest_grades" ).append( "<tr><td>"+result.name+"</td><td>"+result.address+"</td><td><img width=50 src=\""+ratings[resultgrade]+"\" /></td>/tr>" );    

          // $( "#rest_grades" ).append( "<span>Name: "+result.name+"</span>&nbsp;<span>Rating: <img width=50 src=\""+ratings[resultgrade]+"\" /></span><br/>");
          // $( "#rest_grades" ).append( "<span>Address: "+result.address+"</span><br/><br/>");
        //$( "#rest_grades" ).append( "<span>Name: "+result.name+"</span>&nbsp;<span>Rating: "+result.grade+"</span><br/>");
        });

        
    });
    //END OF LISTING ITERATION
    $( "#rest_grades" ).append( "</tbody></table>" );
  });
});