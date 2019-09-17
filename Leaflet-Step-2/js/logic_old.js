// function to get colors based on earthquke magnitude
function getColor(mag) {

  return mag >= 5 ? "red" :
         mag >= 4 ? "orange" :
         mag >= 3 ? "lime" :
         mag >= 2 ? "yellow" :
         mag >= 1 ? "lightgreen" :
         mag >= 0 ? "limegreen" :
                    "red";
}
// function to determine marker size based on population
function markerSize(magnitude) {
  return magnitude * 20000;
}

// function to add legend
function addLegend(map) {
    // Adding legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('div', 'legend');
    labels = [],
    categories = ['0-1', '1-2','2-3','3-4','4-5','5>'];
    
    for (var i = 0; i < categories.length; i++) {
  
      div.innerHTML +=
      '<i style="background:' + getColor(i) + '"></i> ' +
       '<span>'+ categories[i] +'</span>' + '<br>' ;
        
        }
        //div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map);
    // End of adding legend

}
function createMap(quakeLocations, faultLines) {

  // Create the tile layer that will be the background of our map
  // Create the tile layer that will be the background of our map
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

// Initialize all the layerGroups

// Creating baseMaps object
var baseMaps = {
  "Satellite": satellitemap,
  "Grayscale": grayscalemap,
  "Outdoors": outdoorsmap
}

// Create overlay Maps
var overlayMaps = {
  "Fault Lines": faultLines,
  "Earthquakes": quakeLocations
}
  // Create the map object with options
  var map = new L.map("map-id", {
     center: [34.052235, -118.243683],
     zoom: 5,
     layers: [satellitemap, faultLines, quakeLocations]
  });
 
  
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the 
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(map);
  addLegend(map);

}

function createMarkers(response) {
  // Pull the "stations" property off of response.data
  var locations = response.features;
  console.log(locations);
  //var updatedAt = 
  // Initialize an array to hold bike markers
  var quakeMarkers = [];

  // Loop through the earth quake locations array
  for (var i = 0; i < locations.length; i++) {
    // Setting the marker radius for state by passing earth quake
    // Conditionals for earthquake magnitude
    var magnitude = 0, place = "";
    magnitude = locations[i].properties.mag;
    place = locations[i].properties.place;
    var quakeMarker = L.circle([locations[i].geometry.coordinates[1],locations[i].geometry.coordinates[0]], {
      stroke: false,
      fillOpacity: 0.75,
      color: "white",
      fillColor: getColor(locations[i].properties.mag),
      radius: markerSize(locations[i].properties.mag)
    });

    // Add the marker to the quakeMarkers array
    quakeMarkers.push(quakeMarker.bindPopup(`<h3>Magnitude : ${locations[i].properties.mag}</h3>Location: ${place}`));
    
  };
  
  // Create a layer group made from the bike markers array, pass it into the createMap function
  //Invoking createFaults
  var link2 = "data/PB2002_plates.json"; 
  d3.json(link2, function(linesData) {
    
    // Pull the "stations" property off of response.data
    var lines = linesData.features;
    
    //var updatedAt = 
    // Initialize an array to hold bike markers
    var lineMarkers = [];

      
  

// Create a layer group made from the bike markers array, pass it into the createMap 
//createMap(L.layerGroup(quakeMarkers), L.layerGroup(plate));
 
    // Loop through the earth quake locations array
    for (var i = 0; i < lines.length; i++) {
      // Setting the marker radius for state by passing earth quake
      // Conditionals for earthquake magnitude
      var plateName = "";
      plate = lines[i].properties.PlateName;
  
      lineMarker = L.polygon([lines[i].geometry.coordinates[1],lines[i].geometry.coordinates[0]], {
       weight: 1,
      fillOpacity: 0.75,
      color: "red",
      //fillColor: getColor(locations[i].properties.mag),
      dashArray: '3'
      });
  
      // Add the marker to the quakeMarkers array
      lineMarkers.push(lineMarker.bindPopup(`<h3>Plate : ${lines[i].properties.PlateName}</h3>`));
  
    }; 
    
    createMap(L.layerGroup(quakeMarkers), L.layerGroup(plate));
  });
        
}

function createFaults(response) {
/*
// Our style object
var mapStyle = {
  color: "red",
  fillColor: "pink",
  fillOpacity: 0.2,
  weight: 1.5,
  dashArray: '3'
};

// Grabbing our GeoJSON data..
d3.json(link, function(data) {
  console.log(data);
  // Creating a geoJSON layer with the retrieved data
  var plate = new L.geoJson(data, {
    // Passing in our style object
    style: mapStyle
  });
  plate.bindPopup(`<h3>Plate Name: ${data.features.properties}</h3>`);
});

*/
}

// Main program
//Invoking create Markers
var link1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(link1, createMarkers);



