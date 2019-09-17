/****
 * function to get colors based on earthquke magnitude
 */
function getColor(mag) {

  return mag >= 5 ? "red" :
         mag >= 4 ? "orange" :
         mag >= 3 ? "lime" :
         mag >= 2 ? "yellow" :
         mag >= 1 ? "lightgreen" :
         mag >= 0 ? "limegreen" :
                    "red";
}
/*
// function to determine marker size based on population
*/
function markerSize(magnitude) {
  return magnitude * 20000;
}
/**** 
// function to add legend
****/
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
/*****
 * Main Program
 */
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
  
  // Initialize the baseMaps and layerGroups
  
  // Creating baseMaps object
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": grayscalemap,
    "Outdoors": outdoorsmap
  }
  
  // Create overlay Maps
  var faultLines = new L.LayerGroup();
  var quakeLocations = new L.LayerGroup();

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
   
  // Initialize an array to hold earth quake data
  var quakeMarkers = [];

  // Reading the Earthquake data to plot the markers.

  //var link1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  var link1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
  d3.json(link1, function(response) {

        // Pull the "stations" property off of response.data
        var locations = response.features;
        //console.log(locations);

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
        L.layerGroup(quakeMarkers).addTo(quakeLocations);

  });
  
 
    // Creating platonic lines
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(plateData) {
      L.geoJson(plateData, {
        color: "red",
        weight: 2
      })
      .addTo(faultLines);

      // add the faultlines to the map
      //faultLines.addTo(map);

    });
        
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the 
    
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: true
    }).addTo(map);
    addLegend(map);
  
