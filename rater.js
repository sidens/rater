$(function() {

$body = $("body");

// //Attempt at title casing names
// function toTitleCase(str)
// {
//   var lcStr = str.toLowerCase();
//   return lcStr.replace(/(?:^|\s)\w/g, function(match) {
//       return match.toUpperCase();
//   });
// };


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
    {1:"https://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/excellent_50.gif", 2:"https://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/good_50.gif", 3:"https://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/okay_50.gif", 4:"https://www.kingcounty.gov/~/media/depts/health/environmental-health/images/food-safety/inspections/needstoimprove_50.gif"}, //rating images
    "https://www.kingcounty.gov/depts/health/environmental-health/food-safety/inspection-system/~/media/depts/health/environmental-health/images/food-safety/food-safety-ratings-emoji.ashx", //scale image
    "https://www.kingcounty.gov/depts/health/environmental-health/food-safety/inspection-system/food-safety-rating.aspx", //more details from authority
    "https://data.kingcounty.gov/Health/Food-Establishment-Inspection-Data/f29f-zza5", //attribution
    "ADDRESS", //dataset value for street number & address
    "Seattle" //familiar region name

  ],
  
  NYC:
  [
    "https://data.cityofnewyork.us/resource/9w7m-hzhe.json", //url
    "dba", //dataset value for name
    "camis", //dataset value for business id
    "grade", //dataset value for grade
    "IS NOT NULL", //where params
    {"A":"img/NYC/a.png", "B":"img/NYC/b.png", "C":"img/NYC/c.png", "P":"img/NYC/p.png", "Z":"img/NYC/p.png", "Not Yet Graded":"img/NYC/notyetrated.png"}, //rating images
    "img/NYC/nyc-scale.png", //scale image
    "https://www1.nyc.gov/assets/doh/downloads/pdf/rii/inspection-cycle-overview.pdf", //more details from authority
    "https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j", //attribution
    "street", //dataset value for address
    "New York City" //familiar region name
  ]
  ,
  SFO:
  [
    "https://data.sfgov.org/resource/sipz-fjte.json", //url
    "business_name", //dataset value for name
    "business_id", //dataset value for business id
    "inspection_score", //dataset value for grade
    "IS NOT NULL", //where params
    {}, //rating images
    "0-100", //scale 
    "https://www.sfdph.org/dph/EH/Food/Score/", //more details from authority
    "https://data.sfgov.org/Health-and-Social-Services/Restaurant-Scores-LIVES-Standard/pyih-qa8i", //attribution
    "business_address", //dataset value for address
    "San Francisco" //familiar region name
  ],
};



// Excute this function when form is submitted
  $("#search").submit(function(event) {
     $('#loading').show();
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
    // console.log(selectquery);
    var wherequery = userregion[3]+" "+userregion[4];
    // console.log(wherequery);


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
        //Hide Loading Div
        $('#loading').hide();

        //Set fieldnames for each dataset
        var namefield = userregion[1];
        var businessidfield = userregion[2];
        var gradefield = userregion[3];
        var ratings = userregion[5];
        var scale = userregion[6];
        var scaledetails = userregion[7];
        var attribution = userregion[8];
        var addressfield = userregion[9];
        var regionname = userregion[10];

        //check if scale is image
        var str = scale;
        var res = str.split("."); //split on ".", if present, assume URL
        // console.log("res.length: "+res.length);  
        if (res.length == 1)
        {
          $( "#scale" ).append( "<div id=\"ratingdetails\"><h2>"+regionname+"'s Rating Scale</h2><br/><span id=\"scale\">"+scale+"</span></div>");
        }
        else
        {
          $( "#scale" ).append( "<div id=\"ratingdetails\"><h2>"+regionname+"'s Rating Scale</h2><br/><span id=\"scale\"><img width=60% src=\""+scale+"\" /></span></div>");
        }

        //setup scale        
        $( "#scale" ).append( "<div id=\"attribution\"><a href=\""+scaledetails+"\" target=\"_blank\">More Details</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href=\""+attribution+"\" target=\"_blank\">Open Data Source</a></div><br/>");

        //setup table
        $( "#rest_grades"  ).append( "<table id=\"resultslist\" align=\"center\"><thead><tr><th>Name</th><th>Address</th><th>Rating</th></tr></thead><tbody>" );
        
        // console.log(namefield);  

        // console.log("Listings.length:"+listings.length);  

        if (listings.length === 0) {
          $('#resultslist').html("<br/>No Results");
        }

        $.each(listings, function(idx, listing) {
          // Fetch each resturaunt listing  
          
          //set universal params based on listing entries
          // console.log("Listing: "+JSON.stringify(listing));  
          var name = listing[namefield];
          var grade = listing[gradefield];
          var businessid = listing[businessidfield];
          var address = listing[addressfield];
          
          //add Businesses to the results map
          resultsmap[businessid] = {name, grade, address};
          //console.log(JSON.stringify(resultsmap[businessid]));  

        });
        // console.log("results map:");
        // console.log(resultsmap);
        //console.log("Resultsmap.length: "+resultsmap.length);

        $.each(resultsmap, function(idx, result) {
           // console.log("map entry:");
           // console.log(result.name);
           // console.log("index:" + idx);

        //results html, with ratings as key, converting to image
          var resultgrade = result.grade;
          var newrow = "";

          //TODO Title Case Name Results
          //console.log("titlecasedresultname: "+result.name);
          var titlecasedresultname = result.name;

          //console.log("Grade for result: "+resultgrade);
          // console.log("Img for result: "+ratings[resultgrade]);

          var urlescapedname = encodeURIComponent(titlecasedresultname).replace(/%20/g,'+');
          var urlescapedaddress = encodeURIComponent(result.address).replace(/%20/g,'+');
          var urlescapedregion = encodeURIComponent(regionname).replace(/%20/g,'+');
          // console.log("Query Safe URL: "+urlescapedlocation);

          var locationurl = "<a target=\"_blank\" href=\"https://www.google.com/maps/search/?api=1&query="+urlescapedname+"+"+urlescapedaddress+"+"+urlescapedregion+"\">"+result.address+"</a>";
          if (ratings[resultgrade] == null)
          {
             newrow = "<tr><td>"+titlecasedresultname+"</td><td>"+locationurl+"</td><td>"+result.grade+"</td>/tr>";
          }
          else
          {
            newrow = "<tr><td>"+titlecasedresultname+"</td><td>"+locationurl+"</td><td><img width=50 src=\""+ratings[resultgrade]+"\" /></td>/tr>";
          }
          
          
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