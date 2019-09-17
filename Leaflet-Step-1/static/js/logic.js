// function to get colors based on earthquke magnitude
function getColor(mag) {

  return mag >= 5 ? "red" :
         mag >= 4 ? "orange" :
         mag >= 3 ? "limegreen" :
         mag >= 2 ? "lime" :
         mag >= 1 ? "lightgreen" :
         mag >= 0 ? "yellow" :
                    "white";
}
// function to determine marker size based on population
function markerSize(magnitude) {
  return magnitude * 15000;
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
function createMap(quakeLocations) {

  var maxBounds = L.latLngBounds(
    L.latLng(5.499550, -167.276413), //Southwest
    L.latLng(83.162102, -52.233040)  //Northeast
  );

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });


  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Quake Locations": quakeLocations
  };

  // Create the map object with options
  var map = L.map("map-id", {
     center: [34.052235, -118.243683],
     zoom: 5,
     layers: [lightmap, quakeLocations]
  });
 
  
 
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
  addLegend(map);
}

function createMarkers(response) {

  console.log(response.features);

  // Pull the "stations" property off of response.data
  var locations = response.features;
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
      fillOpacity: 0.5,
      color: "white",
      fillColor: getColor(locations[i].properties.mag),
      radius: markerSize(locations[i].properties.mag)
    });

    // Add the marker to the quakeMarkers array
    quakeMarker.bindPopup(`<h3>Magnitude : ${locations[i].properties.mag}</h3>Location: ${place}`);
    quakeMarker.on('mouseover', function (e) {
      this.openPopup();
    });
    quakeMarker.on('mouseout', function (e) {
      this.closePopup();
    });
    quakeMarker.on('click', function (e) {
      this.openPopup();
    });
    quakeMarkers.push(quakeMarker);

  };

  // Create a layer group made from the bike markers array, pass it into the createMap function
  createMap(L.layerGroup(quakeMarkers));
 
}


// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", createMarkers);
