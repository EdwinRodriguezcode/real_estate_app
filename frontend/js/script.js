


  var map;
  // workaround for getting center point of map
  var centerPixel = new google.maps.Point(250, 150);
  var clockOverlay;
  function initialize() {
    var mapOptions = {
      zoom: 18,
      center: new google.maps.LatLng(36.7321,119.7858),




      mapTypeId: google.maps.MapTypeId.SATELLITE,
    };
    var mapDiv = document.getElementById("map_canvas");
    map = new google.maps.Map(mapDiv, mapOptions);

    var clockOverlay = new ClockOverlay();
    clockOverlay.setMap(map);
    clockOverlay.start();
  }

  function ClockOverlay() {
    var horizontalSize = new google.maps.Size(42, 16);
    var horizontalPoint = new google.maps.Point(21, 8);
    var horizontalIcon = new google.maps.MarkerImage(
      "marker_hor.png",
      horizontalSize,
      horizontalPoint
    );

    var verticalSize = new google.maps.Size(16, 42);
    var verticalPoint = new google.maps.Point(8, 21);
    var verticalIcon = new google.maps.MarkerImage(
      "marker_vert.png",
      verticalSize,
      verticalPoint
    );

    var colonSize = new google.maps.Size(16, 42);
    var colonPoint = new google.maps.Point(8, 21);
    var colonIcon = new google.maps.MarkerImage(
      "marker_colon.png",
      colonSize,
      colonPoint
    );

    markerIcons = {};
    markerIcons["hor"] = horizontalIcon;
    markerIcons["vert"] = verticalIcon;
    markerIcons["col"] = colonIcon;
    this.markerIcons = markerIcons;
  }

  ClockOverlay.prototype = new google.maps.OverlayView();

  ClockOverlay.numberLayouts = {
    0: [true, true, true, false, true, true, true],
    1: [false, false, false, false, false, true, true],
    2: [false, true, true, true, true, true, false],
    3: [false, false, true, true, true, true, true],
    4: [true, false, false, true, false, true, true],
    5: [true, false, true, true, true, false, true],
    6: [true, true, true, true, true, false, true],
    7: [false, false, true, false, false, true, true],
    8: [true, true, true, true, true, true, true],
    9: [true, false, true, true, true, true, true],
  };

  ClockOverlay.numberWidth = 60;
  ClockOverlay.numberHeight = 100;
  ClockOverlay.colonWidth = 20;

  ClockOverlay.prototype.start = function () {
    if (this.running) {
      window.clearInterval(this.running);
      delete this.running;
    }

    var me = this;
    window.setInterval(function () {
      me.tick.apply(me);
    }, 1000);
  };

  ClockOverlay.prototype.draw = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }

    // Get the overlay panes
    var panes = this.getPanes();

    // Check if the overlay panes are available
    if (panes) {
      this.imgs = {
        hour_10: [],
        hour_1: [],
        min_10: [],
        min_1: [],
        sec_10: [],
        sec_1: [],
        colon: [],
      };

      var numberWidth = ClockOverlay.numberWidth;
      var colonWidth = ClockOverlay.colonWidth;

      this.div_ = document.createElement("DIV");
      this.div_.style.position = "absolute";
      this.addSegmentImgs("hour_10", 0);
      this.addSegmentImgs("hour_1", numberWidth);
      this.addColonImg(numberWidth * 2);
      this.addSegmentImgs("min_10", numberWidth * 2 + colonWidth);
      this.addSegmentImgs("min_1", numberWidth * 3 + colonWidth);
      this.addColonImg(numberWidth * 4 + colonWidth);
      this.addSegmentImgs("sec_10", numberWidth * 4 + colonWidth * 2);
      this.addSegmentImgs("sec_1", numberWidth * 5 + colonWidth * 2);

      // Initialize clock display to current time
      this.tick();

      // Then add the overlay to the DOM
      panes.overlayLayer.appendChild(this.div_);
    }
  };

  ClockOverlay.prototype.toggleSegments = function (number, place) {
    var numberLayout = ClockOverlay.numberLayouts[number];
    var placeImgs = this.imgs[place];

    for (i = 0; i < placeImgs.length; i++) {
      if (placeImgs[i].style.visibility == "hidden" && numberLayout[i]) {
        // if hidden and should be on
        placeImgs[i].style.visibility = "visible";
      } else if (
        placeImgs[i].style.visibility != "hidden" &&
        !numberLayout[i]
      ) {
        // if showing and should be off
        placeImgs[i].style.visibility = "hidden";
      }
    }
  };

  ClockOverlay.prototype.tick = function () {
    if (!this.div_) {
      return;
    }
    var now = new Date();
    var h = now.getHours() % 12;
    var m = now.getMinutes();
    var s = now.getSeconds();

    this.toggleSegments("" + Math.floor(h / 10), "hour_10");
    this.toggleSegments("" + (h % 10), "hour_1");
    this.toggleSegments("" + Math.floor(m / 10), "min_10");
    this.toggleSegments("" + (m % 10), "min_1");
    this.toggleSegments("" + Math.floor(s / 10), "sec_10");
    this.toggleSegments("" + (s % 10), "sec_1");
  };

  ClockOverlay.prototype.createImg = function (point, place, type) {
    var markerIcon = markerIcons[type];
    var img = document.createElement("img");
    var imgDiv = document.createElement("div");
    img.src = markerIcon.url;
    imgDiv.style.position = "absolute";
    imgDiv.style.visibility = "visible";
    imgDiv.style.top = point.y - markerIcon.origin.y + "px";
    imgDiv.style.left = point.x - markerIcon.origin.x + "px";
    imgDiv.appendChild(img);
    this.imgs[place].push(imgDiv);
    this.div_.appendChild(imgDiv);
  };

  ClockOverlay.prototype.addColonImg = function (offset) {
    var segmentWidth = ClockOverlay.numberWidth * 0.66;
    var segmentHeight = ClockOverlay.numberHeight * 0.5;
    var startPixel = new google.maps.Point(
      centerPixel.x - ClockOverlay.numberWidth * 3 + offset,
      centerPixel.y - ClockOverlay.numberHeight * 0.5 + segmentHeight
    );
    this.createImg(startPixel, "colon", "col");
  };

  ClockOverlay.prototype.addSegmentImgs = function (place, offset) {
    var segmentWidth = ClockOverlay.numberWidth * 0.66;
    var segmentHeight = ClockOverlay.numberHeight * 0.5;

    var startPixel = new google.maps.Point(
      centerPixel.x - ClockOverlay.numberWidth * 3 + offset,
      centerPixel.y - ClockOverlay.numberHeight * 0.5
    );
    var segmentPixel;
    segmentPixel = new google.maps.Point(
      startPixel.x,
      startPixel.y + segmentHeight / 2.0
    );
    this.createImg(segmentPixel, place, "vert");
    segmentPixel = new google.maps.Point(
      startPixel.x,
      startPixel.y + (3 * segmentHeight) / 2.0
    );
    this.createImg(segmentPixel, place, "vert");
    segmentPixel = new google.maps.Point(
      startPixel.x + segmentWidth / 2.0,
      startPixel.y
    );
    this.createImg(segmentPixel, place, "hor");
    segmentPixel = new google.maps.Point(
      startPixel.x + segmentWidth / 2.0,
      startPixel.y + segmentHeight
    );
    this.createImg(segmentPixel, place, "hor");
    segmentPixel = new google.maps.Point(
      startPixel.x + segmentWidth / 2.0,
      startPixel.y + 2 * segmentHeight
    );
    this.createImg(segmentPixel, place, "hor");
    segmentPixel = new google.maps.Point(
      startPixel.x + segmentWidth,
      startPixel.y + segmentHeight / 2.0
    );
    this.createImg(segmentPixel, place, "vert");
    segmentPixel = new google.maps.Point(
      startPixel.x + segmentWidth,
      startPixel.y + (3 * segmentHeight) / 2.0
    );
    this.createImg(segmentPixel, place, "vert");
  };





// this is for the meet the team
new bootstrap.Tooltip(document.querySelector('[data-bs-toggle="tooltip"]'));
      
var cssSwitch = document.getElementById('cssSwitch');
var stylesheetElement = document.getElementsByTagName('link')[0];
var currentStylesheetHref = stylesheetElement.getAttribute('href');



var defaultStylesheetHref = '../../css/default.css';

cssSwitch.addEventListener('change', function() {
  if (cssSwitch.checked) {
    stylesheetElement.setAttribute('href', currentStylesheetHref)
  } else {
    stylesheetElement.setAttribute('href', defaultStylesheetHref);
  }
});


// this is for the geolocationMao



// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 6,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}