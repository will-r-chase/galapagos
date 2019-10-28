var popup = null
mapboxgl.accessToken = 'pk.eyJ1Ijoid2NoYXNlMTQiLCJhIjoiY2p2dnYwOXBvMGJvNDQzcDkxcTZqNWd3dCJ9.UqxE9xtZJevAQem-lKCYnA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/wchase14/cjwwi0ifb3kkb1cmnlwjy956p',
  center: [-90.258, -0.4],
  zoom: 7.99
});

map.scrollZoom.disable();

map.on('load', function() {
  map.fitBounds([
    [
      -89.01123046875,
          -1.5159363834516735
    ],
    [
      -92.3785400390625,
          1.4884800029826135
    ]
  ]);
  map.addSource("islands", {
    type: "geojson",
    data: "https://gist.githubusercontent.com/will-r-chase/3c828bb6dabaefd2ad9227174f26fd04/raw/51abec7820cc3f9f90c728db7fa6710b34719075/islands2.geojson"
  });
  map.addSource("path", {
    type: "geojson",
    data: "https://gist.githubusercontent.com/will-r-chase/017d9de2fb4d34823486f03fdb69fd8c/raw/c5b0a982ca6ccdbb6e7eefc8da46b2380443e4bd/lines.geojson"
  });
  map.addSource("labels", {
    type: "geojson",
    data: "https://gist.githubusercontent.com/will-r-chase/ff6593aac027ae86a38fb2c5117840f2/raw/54b5c13b84d223446c2f89699fe7a14569536861/labels.geojson"
  });

  map.addControl(new mapboxgl.Minimap({
    id: "mapboxgl-minimap",
    width: "200px",
    height: "100px",
    style: "mapbox://styles/wchase14/cjwwi0ifb3kkb1cmnlwjy956p",
    center: [-81.716, 0.074],
    zoom: 2.8,

    // should be a function; will be bound to Minimap
    zoomAdjust: null,

    // if parent map zoom >= 18 and minimap zoom >= 14, set minimap zoom to 16

    lineColor: "#402610",
    lineWidth: 1,
    lineOpacity: 1,

    fillColor: "#F80",
    fillOpacity: 0,

    dragPan: false,
    scrollZoom: false,
    boxZoom: false,
    dragRotate: false,
    keyboard: false,
    doubleClickZoom: false,
    touchZoomRotate: false
  }), 'top-right');

  map.addLayer({
    'id': 'my_lines',
    'type': 'line',
    'source': 'path',
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#402610',
      'line-width': 2,
      'line-opacity': 1,
      'line-dasharray': [3, 3]
    }
  });

  map.addLayer({
    'id': 'my_points',
    'type': 'circle',
    'source': 'islands',
    'interactive': true,
    'paint': {
      'circle-radius': {
        'base': 1.75,
        'stops': [
          [12, 7],
          [22, 15]
        ]
      },
      'circle-color': '#422913',
      'circle-opacity': 1
    }
  });
  map.addLayer({
    'id': 'my_points_clicked',
    'type': 'circle',
    'source': 'islands',
    'interactive': true,
    'paint': {
      'circle-radius': {
        'base': 1.75,
        'stops': [
          [12, 7],
          [22, 15]
        ]
      },
      'circle-color': '#422913',
      'circle-opacity': 1,
      'circle-stroke-width': 5,
      'circle-stroke-color': '#E9E3DD',
      'circle-stroke-opacity:': 1
    },
    'filter': ['==', 'date', '']
  });
  map.addLayer({
    'id': 'symbols',
    'type': 'symbol',
    'source': 'labels',
    'layout': {
      'text-field': '{title}',
      'text-font': ['Alegreya SC Regular'],
      'text-size': 12,
      'text-anchor': 'bottom',
      'text-max-width': Infinity
    },
    'paint': {
      'text-color': '#58402D',
      'text-translate': [0, 20],
      'text-halo-width': 0.5,
      'text-halo-color': '#E9E3DD',
      'text-halo-blur': 0.5
    }
  });
});


map.on('click', function(e) {
  //get the spatial features where your mouse is currently located.
  //note we use the pixel location (e.point) and not lat/lon here.
  //also specify the feature we want to pay attention
  //to - 'academic_positions'
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['my_points']
  });
  if (!features.length) {
    return;
  }

  popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
  });

  //set a filter on the academic_positions_clicked layer
  //so that the point we clicked on shows up
  map.setFilter('my_points_clicked', ['==', 'date', features[0].properties.date]);
  //set the location of our popup to the
  //lnglat of our click (note we use e.lnglat here and NOT e.point)
  popup.setLngLat(e.lngLat);
  //give the popup content
  popup.setHTML(
    "<h3>" + features[0].properties.island + "</h3><h4>" +
    features[0].properties.date +
    "</h4><br>" + features[0].properties.notes +
    "</br></br>" +
    "<div class='wrap-collabsible'><input id='collapsible' class='toggle' type='checkbox'><label for='collapsible' class='lbl-toggle'>Read Darwin's journal entries from this time</label><div class='collapsible-content'><div class='content-inner'><p>" +
    features[0].properties.journals +
    "</p></div></div></div>"
  );
  //finally add the popup to the map
  popup.addTo(map);
  //map.panTo(e.lngLat);
});

//When the mouse moves over a spatial layer
//we care about (e.g. a point) let's change the mouse cursor
map.on("mousemove", function(e) {
  //get the province feature underneath the mouse
  var features = map.queryRenderedFeatures(e.point, {
    layers: ["my_points"]
  });
  //if there's a point under our mouse, then do the following.
  if (features.length > 0) {
    //use the following code to change the
    //cursor to a pointer ('pointer') instead of the default ('')
    map.getCanvas().style.cursor = (features[0].properties.date !== null) ? 'pointer' : '';
  }
  //if there are no points under our mouse,
  //then change the cursor back to the default
  else {
    map.getCanvas().style.cursor = '';
  }
});
