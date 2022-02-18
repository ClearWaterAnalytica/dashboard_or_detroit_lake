// Initial load GIF
$(window).ready(function() {
  $('.loader').fadeOut("slow");
});

// bounds of lake
var lakeBounds = L.latLngBounds(
  L.latLng(44.607486241841485, -122.65328825946432), //Southwest
  L.latLng(44.79646203583117, -122.09510671380221), //Northeast
);

var lakeBoundsClosed = L.latLngBounds(
  L.latLng(44.6518457695288, -122.30459300466374), //Southwest
  L.latLng(44.76672930999038, -122.09269384395935), //Northeast
);

var lakeBoundsClosedMini = L.latLngBounds(
  L.latLng(44.6518457695288, -122.43459300466374), //Southwest
  L.latLng(44.76672930999038, -122.09269384395935), //Northeast
);

// Create map element
var mymap = L.map('map', {
  // center: [44.70580544041939, -122.24899460193791],
  zoomControl: false,
  zoom: 14,
  maxZoom: 15,
  minZoom: 11,
  // maxBounds: lakeBounds,
  // maxBoundsViscosity: .8,
});

// Initial map bounds
mymap.fitBounds(lakeBoundsClosedMini);

// Baselayer maps
var voyager =
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png');
var satellite =
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
// Initial basemap
var USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 20,
  attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
}).addTo(mymap);

var baseLayers = {
  'CartoDB Voyager': voyager,
  'ESRI Satellite': satellite,
  'USGS_USImagery': USGS_USImagery,
}

// Mouse position on map leaflet plugin
L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomleft',
    separator: ' : ',
    emptyString: 'Unavailable',
    lngFirst: false,
    numDigits: 5,
    lngFormatter: undefined,
    latFormatter: undefined,
    prefix: ""
  },
  onAdd: function(map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    mymap.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML = this.options.emptyString;
    return this._container;
  },
  onRemove: function(map) {
    map.off('mousemove', this._onMouseMove)
  },
  _onMouseMove: function(e) {
    var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + ' ' + value;
    this._container.innerHTML = prefixAndValue;
  }
});
L.Map.mergeOptions({
  positionControl: false
});
L.Map.addInitHook(function() {
  if (this.options.positionControl) {
    this.positionControl = new L.Control.MousePosition();
    this.addControl(this.positionControl);
  }
});
L.control.mousePosition = function(options) {
  return new L.Control.MousePosition(options);
};

// Add mouse position plug-in to top right of map
L.control.mousePosition({
  position: 'topright'
}).addTo(mymap);
// Add map scale to top right of map
L.control.scale({
  position: 'topright'
}).addTo(mymap);
// Add control layers for basemaps to top right of map
new L.control.layers(baseLayers, {}, {
  collapsed: true
}).addTo(mymap);
// Add zoom home to top right of map
new L.Control.zoomHome({
  position: 'topright'
}).addTo(mymap);


var chart, sampleChart, precipChart, airTempChart, toxinChart, nitrateChart;

// Create color scale for hexbins and hexbin legend
var colors = chroma.scale('Spectral').domain([0, 1]).padding(0.15).mode('lch').colors(6);

// Create hexbin color legend
for (i = 0; i < 6; i++) {
  $('head').append($("<style> .legend-color-" + (i + 1).toString() + " { background: " + colors[i] + "; font-size: 15px; opacity: .6; text-shadow: 0 0 0px #ffffff;} </style>"));
}

// var cardRules = new Array();
// var chlMinExtent = 0;
// var chlMaxExtent = 0;
//
//     $.get('assets/meta_data.txt', function(data){
//             cardRules = data.split('\n');
//             console.log(cardRules);
//             chlMinExtentSplit = cardRules[6].split(' ');
//             chlMinExtentLocal = chlMinExtentSplit[4] * 1;
//             chlMaxExtentLocal = chlMinExtentSplit[8].trimRight(2) * 1;
//             chlMinExtent = chlMinExtentLocal;
//             chlMaxExtent = chlMaxExtentLocal;
//
//         });
//
// colorScaleExtentCHL = []
// minChlExtent = chlMinExtentSplit.split(' ');

// Chlorophyl a hexbin options
var options = {
  radius: 12,
  opacity: .6,
  colorRange: [colors[5], colors[4], colors[3], colors[2], colors[1], colors[0]],
  colorScaleExtent: [.53, 1.22],
  // colorScaleExtent: [chlMinExtent, chlMaxExtent],
  duration: 500,
  radiusRange: [11, 11],
};

// CYaN hexbin options
var optionsCyan = {
  radius: 20,
  opacity: .6,
  colorRange: [colors[5], colors[4], colors[3], colors[2], colors[1], colors[0]],
  colorScaleExtent: [2.17, 8.75],
  duration: 500,
  radiusRange: [11, 11],
};

// Add Chlorophyl A hexbin map layer
var hexLayer = L.hexbinLayer(options).addTo(mymap);

var hexCyanLayer = L.hexbinLayer(optionsCyan);

// $("#CHARadio").on("click", function() {
//
//   hexLayer.addTo(mymap);
// });
//
// $("#CYANRadio").on("click", function() {
//   hexCyanLayer.addTo(mymap);
// });

// Tooltip function for Chlorophyl A hexbins
function tooltip_function(d) {
// Collect all Chlorophyl values in given hexbin
  var chlA_sum = d.reduce(function(acc, obj) {
    return (acc + parseFloat(obj["o"][2]));
  }, 0);
// Average chlorophyl values in given hexbin
  avgChl = chlA_sum / d.length;
// Format Chlorophyl values to 3 decimal places
  avgChl = d3.format(".3")(avgChl);
  // Create tooltip text
  var tooltip_text = `Avg. Chlorophyll: ${String(avgChl)}`
  // Return tooltip text
  return tooltip_text
}

// Tooltip function for CYaN hexbins
function tooltip_functionCyAN(d) {
  var cyan_sum = d.reduce(function(acc, obj) {
    return (acc + parseFloat(obj["o"][2]));
  }, 0);
  avgCyan = cyan_sum / d.length;
  avgcyan = d3.format(".3")(avgCyan);
  var tooltip_text = `Avg. CyAN: ${String(avgCyan)}`
  return tooltip_text
}

// Update opacity of hexbins to opacitly slider value
$('#myOpacityRange').on('input', function(value) {
  $('.hexbin').css({
    opacity: $(this).val() * '.1'
  });
});

// Create Chlorophyl A hexbin layer
hexLayer
// hexbin longitute value
  .lng(function(d) {
    return d[0];
  })
  // hexbin latitude value
  .lat(function(d) {
    return d[1];
  })
  // color values for hexbins
  .colorValue(
    // assign hexbin colors to average chlorophyl A values
    function(d) {
      var sum = d.reduce(function(acc, obj) {
        return (acc + parseFloat(obj["o"][2]));
      }, 0);
      avgChl = sum / d.length;
      return avgChl
    }
  )
  // Assign tooltip function to the hexbin hover handler
  .hoverHandler(L.HexbinHoverHandler.compound({
    handlers: [
      L.HexbinHoverHandler.resizeFill(),
      L.HexbinHoverHandler.tooltip({
        tooltipContent: tooltip_function
      })
    ]
  }));

// CYAN hexbin
hexCyanLayer
  .lng(function(d) {
    return d[0];
  })
  .lat(function(d) {
    return d[1];
  })
  .colorValue(
    function(d) {
      var sum = d.reduce(function(acc, obj) {
        return (acc + parseFloat(obj["o"][2]));
      }, 0);
      avgChl = sum / d.length;
      return avgChl
    }
  )
  .hoverHandler(L.HexbinHoverHandler.compound({
    handlers: [
      L.HexbinHoverHandler.resizeFill(),
      L.HexbinHoverHandler.tooltip({
        tooltipContent: tooltip_functionCyAN
      })
    ]
  }));

// Date slider
dateSelect = $('#d0').val();
let [y, m, d] = dateSelect.split('-');
mapYear = y;
mapMonth = m;
mapDay = d;
mapDateString = mapYear + '_' + mapMonth + '_' + mapDay;

// Parse date in YYYY-MM-DD format as local date
function parseISOLocal(s) {
  let [y, m, d] = s.split('-');
  return new Date(y, m - 1, d);
}

// Format date as YYYY-MM-DD
function dateToISOLocal(date) {
  let z = n => ('0' + n).slice(-2);
  return date.getFullYear() + '-' + z(date.getMonth() + 1) + '-' + z(date.getDate());
}

// Convert range slider value to date string
function range2date(evt) {
  let dateInput = document.querySelector('#d0');
  let minDate = parseISOLocal(dateInput.min);
  minDate.setDate(minDate.getDate() + Number(this.value));
  dateInput.value = dateToISOLocal(minDate);
  dateSelect = $('#d0').val();
  let [y, m, d] = dateSelect.split('-');
  mapYear = y;
  mapMonth = m;
  mapDay = d;
  mapDateString = mapYear + '_' + mapMonth + '_' + mapDay;
  titleDateString = mapMonth + '/' + mapDay + '/' + mapYear;

  Promise.all([
    d3.csv('assets/satellite_map/detroit_lake_chlorophyll_' + mapDateString + '.csv'), //datasets[0]
  ]).then(function(datasets) {
    hexdata = [];
    datasets[0].forEach(function(d) {
      hexdata.push([
        d.lon,
        d.lat,
        d.Chlorophyll,
      ]);
    })
    hexLayer.data(hexdata);
  });
  $("#sat-title").text(titleDateString);
}


// Convert entered date to range
function date2range(evt) {
  let date = parseISOLocal(this.value);
  let numDays = (date - new Date(this.min)) / 8.64e7;
  document.querySelector('#myRange').value = numDays;
  dateSelect = $('#d0').val();
  let [y, m, d] = dateSelect.split('-');
  mapYear = y;
  mapMonth = m;
  mapDay = d;
  mapDateString = mapYear + '_' + mapMonth + '_' + mapDay;

  Promise.all([
    d3.csv('assets/satellite_map/detroit_lake_chlorophyll_' + mapDateString + '.csv'), //datasets[0]
  ]).then(function(datasets) {
    hexdata = [];
    datasets[0].forEach(function(d) {
      hexdata.push([
        d.lon,
        d.lat,
        d.Chlorophyll,
      ]);
    })
    hexLayer.data(hexdata);
  });
}

window.onload = function() {
  let rangeInput = document.querySelector('#myRange');
  let dateInput = document.querySelector('#d0');
  // Get the number of days from the date min and max
  // Dates in YYYY-MM-DD format are treated as UTC
  // so will be exact whole days

  let rangeMax = (new Date(dateInput.max) - new Date(dateInput.min)) / 8.64e7;
  // Set the range min and max values
  rangeInput.min = 0;
  rangeInput.max = rangeMax;
  // Add listener to set the date input value based on the slider
  rangeInput.addEventListener('input', range2date, false);
  // Add listener to set the range input value based on the date
  dateInput.addEventListener('change', date2range, false);
}

// set initial stream gage ID
var gageID = "14178000";

// Load in data
Promise.all([
  d3.csv('assets/stream_gauge_tab/gage.csv'), //datasets[0]
  d3.json("assets/stream_gauge_tab/usgs.geojson"), //datasets[1]
  d3.csv('assets/water_sample_tab/algae.csv'), //datasets[2]
  d3.json("assets/water_sample_tab/ws.geojson"), //datasets[3]
  d3.csv('assets/satellite_map/detroit_lake_chlorophyll_' + mapDateString + '.csv'), //datasets[4]
  d3.csv('assets/weather_tab/detroit_lake_prism_2020_01_01_2021_09_15.csv'), //datasets[5]
  d3.csv('assets/water_sample_tab/toxin.csv'), //datasets[6]
  d3.csv('assets/water_sample_tab/nitrate.csv'), //datasets[7]
  d3.json("assets/weather_tab/weather.geojson"), //datasets[8]
  d3.csv('assets/water_sample_tab/algae/algae2016.csv'), //datasets[9]
  d3.csv('assets/water_sample_tab/algae/algae2017.csv'), //datasets[10]
  d3.csv('assets/water_sample_tab/algae/algae2018.csv'), //datasets[11]
  d3.csv('assets/water_sample_tab/algae/algae2019.csv'), //datasets[12]
  d3.csv('assets/water_sample_tab/toxin/toxin2016.csv'), //datasets[13]
  d3.csv('assets/water_sample_tab/toxin/toxin2017.csv'), //datasets[14]
  d3.csv('assets/water_sample_tab/toxin/toxin2018.csv'), //datasets[15]
  d3.csv('assets/water_sample_tab/toxin/toxin2019.csv'), //datasets[16]
  d3.csv('assets/water_sample_tab/nitrate/nitrate2016.csv'), //datasets[17]
  d3.csv('assets/water_sample_tab/nitrate/nitrate2017.csv'), //datasets[18]
  d3.csv('assets/water_sample_tab/nitrate/nitrate2018.csv'), //datasets[19]
  d3.csv('assets/water_sample_tab/nitrate/nitrate2019.csv'), //datasets[20]
  d3.csv('assets/stream_gauge_tab/gage2020.csv'), //datasets[21]
  d3.csv('assets/stream_gauge_tab/gage2021.csv'), //datasets[22]
  d3.csv('assets/weather_tab/prism2020.csv'), //datasets[23]
  d3.csv('assets/weather_tab/prism2021.csv'), //datasets[24]
  d3.csv('assets/stream_gage_tab/detroit_lake_usgsStreamgage.csv'), //datasets[25]
  d3.csv('assets/satellite_map/dates.csv'), //datasets[26]
  d3.csv('assets/weather_tab/detroit_lake_gridmet.csv'), //datasets[27]
  d3.csv('assets/water_sample_tab/detroit_lake_algae_2016_05_03_2019_10_30.csv'), //datasets[28]
  d3.csv('assets/now_cast_tab/detroit_lake_nowcast_predictions.csv'), //datasets[29]
  d3.csv('assets/cyan_map/detroit_lake_cyan_2021_10_06.csv'), //datasets[30]
  d3.csv('assets/exp_cyan_tab/detroit_lake_exp_cyan.csv'), //datasets[31]
  d3.csv('assets/exp_cyan_tab/detroit_lake_exp_cyan_test.csv'), //datasets[32]
  d3.csv('assets/now_cast_tab/detroit_lake_nowcast_expected_longrun_predictions.csv'), //datasets[33]

]).then(function(datasets) {

  function hexbinFunction(i) {

    hexdata = [];
    datasets[4].forEach(function(d) {
      hexdata.push([
        d.lon,
        d.lat,
        d.Chlorophyll,
      ]);
    })
    hexLayer.data(hexdata);
  };
  hexbinFunction();

  hexCyanData = [];
  datasets[30].forEach(function(d) {
    hexCyanData.push([
      d.lon,
      d.lat,
      d.log_CI_cells_mL,
      d.bloom,
    ]);
  })
  hexCyanLayer.data(hexCyanData);

  //  Expected Cyan data
  dateArray2022 = ["Date"];
  expCyanDate = ["Date"];
  logCICells = ["Log_CI_Cells_mL"];
  // expCyanBloom = ["Bloom"];
  var expCyanVars = {
    name: "Expected CyAN",
    lCI: logCICells,
    // ecb: expCyanBloom,
  }

  function expCyanCounts(i) {
    let expCyanData = datasets[33];
    for (let i = 0; i < expCyanData.length; i++) {
      dateReformat = expCyanData[i].date.split("-");
      year = dateReformat[0];
      month = dateReformat[1];
      day = dateReformat[2];
      reformattedDate = month + "/" + day + "/" + year;
      var USTd = new Date(reformattedDate)
      expCyanDate.push(USTd.setHours(USTd.getHours() + 8));
      logCICells.push(expCyanData[i].prob_exp);
      // expCyanBloom.push(expCyanData[i].bloom);
    };

  };
  expCyanCounts(expCyanVars);
  // Nowcast data
  nct = ["Date"];
  bloom_p = ["Probability_of_bloom"];
  bloom_1_p = ["Probability of no bloom"];
  model_accuracy = ["Accuracy of the now-cast model"];
  nctCurrentDate = ["Current"];

  var nowCastVars = {
    name: "Now Cast",
    bp: bloom_p,
    b1p: bloom_1_p,
    ma: model_accuracy,
    cd: nctCurrentDate,
  }



  function nowCastCounts(i) {
    let nowCastData = datasets[29];
    for (let i = 0; i < nowCastData.length; i++) {
      dateReformat = nowCastData[i].date.split("-");
      year = dateReformat[0];
      month = dateReformat[1];
      day = dateReformat[2];
      reformattedDate = month + "/" + day + "/" + year;
      reformattedDateDonut = month + "/" + day;
      var USTd = new Date(reformattedDate)
      currentDateDonut = new Date(USTd.getFullYear(), USTd.getMonth(), USTd.getDate());
      nct.push(USTd.setHours(USTd.getHours() + 8));
      bloom_p.push(nowCastData[i].bloom_p);
      bloom_1_p.push(nowCastData[i].bloom_1_p);
      model_accuracy.push(nowCastData[i].model_accuracy);
      if (i == nowCastData.length - 1) {
        nctCurrentDate.push(1)
      } else if (i !== nowCastData.length) {
        nctCurrentDate.push('null')
      }
      var lastweek = new Date(USTd.getFullYear(), USTd.getMonth(), USTd.getDate() + 7);
      currentDateDonutReformatted = currentDateDonut.getMonth() + 1 + "/" + currentDateDonut.getDate();
      currentDateDonutReformattedUpdate = currentDateDonut.getMonth() + 1 + "/" + currentDateDonut.getDate() + "/" + currentDateDonut.getFullYear();
      lastweekReformatted = lastweek.getMonth() + 1 + "/" + lastweek.getDate();

      $("#dateCyan").text(currentDateDonutReformatted + "-" + lastweekReformatted);
      $("#dateCyan2").text(currentDateDonutReformatted + "-" + lastweekReformatted);
    }
  }



  // Weather Data
  var wt = ["Date"];
  var wt2020 = ["Date"];
  var wt2021 = ["Date"];
  var precip = ["Precipitation"];
  var precip2020 = ["2020"];
  var precip2021 = ["2021"];
  var airTemp = ["Air Temperature"];
  var airTemp2020 = ["2020"];
  var airTemp2021 = ["2021"];
  weatherData2021 = [];
  weatherData2022pcMean = ["2022"];
  weatherData2022pcSum = ["2022"];
  weatherData2022atempMean = ["2022"];
  weatherData2022atempSum = ["2022"];
  weatherData2022surfMean = ["2022"];
  weatherData2022surfSum = ["2022"];
  weatherData2022windMean = ["2022"];
  weatherData2022windSum = ["2022"];
  weatherData2021pcMean = ["2021"];
  weatherData2021pcSum = ["2021"];
  weatherData2021atempMean = ["2021"];
  weatherData2021atempSum = ["2021"];
  weatherData2021surfMean = ["2021"];
  weatherData2021surfSum = ["2021"];
  weatherData2021windMean = ["2021"];
  weatherData2021windSum = ["2021"];
  weatherData2020 = [];
  weatherData2020pcMean = ["2020"];
  weatherData2020pcSum = ["2020"];
  weatherData2020atempMean = ["2020"];
  weatherData2020atempSum = ["2020"];
  weatherData2020surfMean = ["2020"];
  weatherData2020surfSum = ["2020"];
  weatherData2020windMean = ["2020"];
  weatherData2020windSum = ["2020"];
  weatherData2019 = [];
  weatherData2019pcMean = ["2019"];
  weatherData2019pcSum = ["2019"];
  weatherData2019atempMean = ["2019"];
  weatherData2019atempSum = ["2019"];
  weatherData2019surfMean = ["2019"];
  weatherData2019surfSum = ["2019"];
  weatherData2019windMean = ["2019"];
  weatherData2019windSum = ["2019"];
  weatherData2018 = [];
  weatherData2018pcMean = ["2018"];
  weatherData2018pcSum = ["2018"];
  weatherData2018atempMean = ["2018"];
  weatherData2018atempSum = ["2018"];
  weatherData2018surfMean = ["2018"];
  weatherData2018surfSum = ["2018"];
  weatherData2018windMean = ["2018"];
  weatherData2018windSum = ["2018"];
  weatherData2017 = [];
  weatherData2017pcMean = ["2017"];
  weatherData2017pcSum = ["2017"];
  weatherData2017atempMean = ["2017"];
  weatherData2017atempSum = ["2017"];
  weatherData2017surfMean = ["2017"];
  weatherData2017surfSum = ["2017"];
  weatherData2017windMean = ["2017"];
  weatherData2017windSum = ["2017"];
  weatherData2016 = [];
  weatherData2016pcMean = ["2016"];
  weatherData2016pcSum = ["2016"];
  weatherData2016atempMean = ["2016"];
  weatherData2016atempSum = ["2016"];
  weatherData2016surfMean = ["2016"];
  weatherData2016surfSum = ["2016"];
  weatherData2016windMean = ["2016"];
  weatherData2016windSum = ["2016"];
  weatherData2015 = [];
  weatherData2015pcMean = ["2015"];
  weatherData2015pcSum = ["2015"];
  weatherData2015atempMean = ["2015"];
  weatherData2015atempSum = ["2015"];
  weatherData2015surfMean = ["2015"];
  weatherData2015surfSum = ["2015"];
  weatherData2015windMean = ["2015"];
  weatherData2015windSum = ["2015"];
  weatherData2014 = [];
  weatherData2014pcMean = ["2014"];
  weatherData2014pcSum = ["2014"];
  weatherData2014atempMean = ["2014"];
  weatherData2014atempSum = ["2014"];
  weatherData2014surfMean = ["2014"];
  weatherData2014surfSum = ["2014"];
  weatherData2014windMean = ["2014"];
  weatherData2014windSum = ["2014"];
  weatherData2013 = [];
  weatherData2013pcMean = ["2013"];
  weatherData2013pcSum = ["2013"];
  weatherData2013atempMean = ["2013"];
  weatherData2013atempSum = ["2013"];
  weatherData2013surfMean = ["2013"];
  weatherData2013surfSum = ["2013"];
  weatherData2013windMean = ["2013"];
  weatherData2013windSum = ["2013"];
  weatherData2012 = [];
  weatherData2012pcMean = ["2012"];
  weatherData2012pcSum = ["2012"];
  weatherData2012atempMean = ["2012"];
  weatherData2012atempSum = ["2012"];
  weatherData2012surfMean = ["2012"];
  weatherData2012surfSum = ["2012"];
  weatherData2012windMean = ["2012"];
  weatherData2012windSum = ["2012"];



  var weatherVars = {
    name: "Precip",
    pcM2022: weatherData2022pcMean,
    pcS2022: weatherData2022pcSum,
    atempM2022: weatherData2022atempMean,
    atempS2022: weatherData2022atempSum,
    surfM2022: weatherData2022surfMean,
    surfS2022: weatherData2022surfSum,
    windM2022: weatherData2022windMean,
    windS2022: weatherData2022windSum,
    pcM2021: weatherData2021pcMean,
    pcS2021: weatherData2021pcSum,
    atempM2021: weatherData2021atempMean,
    atempS2021: weatherData2021atempSum,
    surfM2021: weatherData2021surfMean,
    surfS2021: weatherData2021surfSum,
    windM2021: weatherData2021windMean,
    windS2021: weatherData2021windSum,
    pcM2020: weatherData2020pcMean,
    pcS2020: weatherData2020pcSum,
    atempM2020: weatherData2020atempMean,
    atempS2020: weatherData2020atempSum,
    surfM2020: weatherData2020surfMean,
    surfS2020: weatherData2020surfSum,
    windM2020: weatherData2020windMean,
    windS2020: weatherData2020windSum,
    pcM2019: weatherData2019pcMean,
    pcS2019: weatherData2019pcSum,
    atempM2019: weatherData2019atempMean,
    atempS2019: weatherData2019atempSum,
    surfM2019: weatherData2019surfMean,
    surfS2019: weatherData2019surfSum,
    windM2019: weatherData2019windMean,
    windS2019: weatherData2019windSum,
    pcM2018: weatherData2018pcMean,
    pcS2018: weatherData2018pcSum,
    atempM2018: weatherData2018atempMean,
    atempS2018: weatherData2018atempSum,
    surfM2018: weatherData2018surfMean,
    surfS2018: weatherData2018surfSum,
    windM2018: weatherData2018windMean,
    windS2018: weatherData2018windSum,
    pcM2017: weatherData2017pcMean,
    pcS2017: weatherData2017pcSum,
    atempM2017: weatherData2017atempMean,
    atempS2017: weatherData2017atempSum,
    surfM2017: weatherData2017surfMean,
    surfS2017: weatherData2017surfSum,
    windM2017: weatherData2017windMean,
    windS2017: weatherData2017windSum,
    pcM2016: weatherData2016pcMean,
    pcS2016: weatherData2016pcSum,
    atempM2016: weatherData2016atempMean,
    atempS2016: weatherData2016atempSum,
    surfM2016: weatherData2016surfMean,
    surfS2016: weatherData2016surfSum,
    windM2016: weatherData2016windMean,
    windS2016: weatherData2016windSum,
    pcM2015: weatherData2015pcMean,
    pcS2015: weatherData2015pcSum,
    atempM2015: weatherData2015atempMean,
    atempS2015: weatherData2015atempSum,
    surfM2015: weatherData2015surfMean,
    surfS2015: weatherData2015surfSum,
    windM2015: weatherData2015windMean,
    windS2015: weatherData2015windSum,
    pcM2014: weatherData2014pcMean,
    pcS2014: weatherData2014pcSum,
    atempM2014: weatherData2014atempMean,
    atempS2014: weatherData2014atempSum,
    surfM2014: weatherData2014surfMean,
    surfS2014: weatherData2014surfSum,
    windM2014: weatherData2014windMean,
    windS2014: weatherData2014windSum,
    pcM2013: weatherData2013pcMean,
    pcS2013: weatherData2013pcSum,
    atempM2013: weatherData2013atempMean,
    atempS2013: weatherData2013atempSum,
    surfM2013: weatherData2013surfMean,
    surfS2013: weatherData2013surfSum,
    windM2013: weatherData2013windMean,
    windS2013: weatherData2013windSum,
    pcM2012: weatherData2012pcMean,
    pcS2012: weatherData2012pcSum,
    atempM2012: weatherData2012atempMean,
    atempS2012: weatherData2012atempSum,
    surfM2012: weatherData2012surfMean,
    surfS2012: weatherData2012surfSum,
    windM2012: weatherData2012windMean,
    windS2012: weatherData2012windSum,
  }

  function varsCounts(i) {
    let weatherData = datasets[27];
    for (let i = 0; i < weatherData.length; i++) {
      weatherDate = new Date(weatherData[i].date);
      yearConversion = weatherDate.setHours(weatherDate.getHours() + 8);
      yearWeather = weatherDate.getFullYear();

      // dateGage1Reformat = streamGageData[i].date.split("-");
      // yearGage1 = dateGage1Reformat[0];
      switch (yearWeather) {
        case 2022:
          if (weatherData[i].Precip_mean == "") {
            weatherData2022pcMean.push("null");
          } else {
            weatherData2022pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2022pcSum.push("null");
          } else {
            weatherData2022pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2022atempMean.push("null");
          } else {
            weatherData2022atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2022atempSum.push("null");
          } else {
            weatherData2022atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2022surfMean.push("null");
          } else {
            weatherData2022surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2022surfSum.push("null");
          } else {
            weatherData2022surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2022windMean.push("null");
          } else {
            weatherData2022windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2022windSum.push("null");
          } else {
            weatherData2022windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2021:
          if (weatherData[i].Precip_mean == "") {
            weatherData2021pcMean.push("null");
          } else {
            weatherData2021pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2021pcSum.push("null");
          } else {
            weatherData2021pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2021atempMean.push("null");
          } else {
            weatherData2021atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2021atempSum.push("null");
          } else {
            weatherData2021atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2021surfMean.push("null");
          } else {
            weatherData2021surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2021surfSum.push("null");
          } else {
            weatherData2021surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2021windMean.push("null");
          } else {
            weatherData2021windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2021windSum.push("null");
          } else {
            weatherData2021windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2020:
          if (weatherData[i].Precip_mean == "") {
            weatherData2020pcMean.push("null");
          } else {
            weatherData2020pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2020pcSum.push("null");
          } else {
            weatherData2020pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2020atempMean.push("null");
          } else {
            weatherData2020atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2020atempSum.push("null");
          } else {
            weatherData2020atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2020surfMean.push("null");
          } else {
            weatherData2020surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2020surfSum.push("null");
          } else {
            weatherData2020surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2020windMean.push("null");
          } else {
            weatherData2020windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2020windSum.push("null");
          } else {
            weatherData2020windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2019:
          if (weatherData[i].Precip_mean == "") {
            weatherData2019pcMean.push("null");
          } else {
            weatherData2019pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2019pcSum.push("null");
          } else {
            weatherData2019pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2019atempMean.push("null");
          } else {
            weatherData2019atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2019atempSum.push("null");
          } else {
            weatherData2019atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2019surfMean.push("null");
          } else {
            weatherData2019surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2019surfSum.push("null");
          } else {
            weatherData2019surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2019windMean.push("null");
          } else {
            weatherData2019windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2019windSum.push("null");
          } else {
            weatherData2019windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2018:
          if (weatherData[i].Precip_mean == "") {
            weatherData2018pcMean.push("null");
          } else {
            weatherData2018pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2018pcSum.push("null");
          } else {
            weatherData2018pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2018atempMean.push("null");
          } else {
            weatherData2018atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2018atempSum.push("null");
          } else {
            weatherData2018atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2018surfMean.push("null");
          } else {
            weatherData2018surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2018surfSum.push("null");
          } else {
            weatherData2018surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2018windMean.push("null");
          } else {
            weatherData2018windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2018windSum.push("null");
          } else {
            weatherData2018windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2017:
          if (weatherData[i].Precip_mean == "") {
            weatherData2017pcMean.push("null");
          } else {
            weatherData2017pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2017pcSum.push("null");
          } else {
            weatherData2017pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2017atempMean.push("null");
          } else {
            weatherData2017atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2017atempSum.push("null");
          } else {
            weatherData2017atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2017surfMean.push("null");
          } else {
            weatherData2017surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2017surfSum.push("null");
          } else {
            weatherData2017surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2017windMean.push("null");
          } else {
            weatherData2017windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2017windSum.push("null");
          } else {
            weatherData2017windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2016:
          if (weatherData[i].Precip_mean == "") {
            weatherData2016pcMean.push("null");
          } else {
            weatherData2016pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2016pcSum.push("null");
          } else {
            weatherData2016pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2016atempMean.push("null");
          } else {
            weatherData2016atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2016atempSum.push("null");
          } else {
            weatherData2016atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2016surfMean.push("null");
          } else {
            weatherData2016surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2016surfSum.push("null");
          } else {
            weatherData2016surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2016windMean.push("null");
          } else {
            weatherData2016windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2016windSum.push("null");
          } else {
            weatherData2016windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2015:
          if (weatherData[i].Precip_mean == "") {
            weatherData2015pcMean.push("null");
          } else {
            weatherData2015pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2015pcSum.push("null");
          } else {
            weatherData2015pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2015atempMean.push("null");
          } else {
            weatherData2015atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2015atempSum.push("null");
          } else {
            weatherData2015atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2015surfMean.push("null");
          } else {
            weatherData2015surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2015surfSum.push("null");
          } else {
            weatherData2015surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2015windMean.push("null");
          } else {
            weatherData2015windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2015windSum.push("null");
          } else {
            weatherData2015windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2014:
          if (weatherData[i].Precip_mean == "") {
            weatherData2014pcMean.push("null");
          } else {
            weatherData2014pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2014pcSum.push("null");
          } else {
            weatherData2014pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2014atempMean.push("null");
          } else {
            weatherData2014atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2014atempSum.push("null");
          } else {
            weatherData2014atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2014surfMean.push("null");
          } else {
            weatherData2014surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2014surfSum.push("null");
          } else {
            weatherData2014surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2014windMean.push("null");
          } else {
            weatherData2014windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2014windSum.push("null");
          } else {
            weatherData2014windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2013:
          if (weatherData[i].Precip_mean == "") {
            weatherData2013pcMean.push("null");
          } else {
            weatherData2013pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2013pcSum.push("null");
          } else {
            weatherData2013pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2013atempMean.push("null");
          } else {
            weatherData2013atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2013atempSum.push("null");
          } else {
            weatherData2013atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2013surfMean.push("null");
          } else {
            weatherData2013surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2013surfSum.push("null");
          } else {
            weatherData2013surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2013windMean.push("null");
          } else {
            weatherData2013windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2013windSum.push("null");
          } else {
            weatherData2013windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        case 2012:
          var USTd = new Date(yearConversion)
          wt.push(USTd.setHours(USTd.getHours() + 8));
          if (weatherData[i].Precip_mean == "") {
            weatherData2012pcMean.push("null");
          } else {
            weatherData2012pcMean.push(weatherData[i].Precip_mean);
          };
          if (weatherData[i].Precip_cumsum == "") {
            weatherData2012pcSum.push("null");
          } else {
            weatherData2012pcSum.push(weatherData[i].Precip_cumsum);
          };
          if (weatherData[i].Air_Temp_mean == "") {
            weatherData2012atempMean.push("null");
          } else {
            weatherData2012atempMean.push(weatherData[i].Air_Temp_mean);
          };
          if (weatherData[i].Air_Temp_cumsum == "") {
            weatherData2012atempSum.push("null");
          } else {
            weatherData2012atempSum.push(weatherData[i].Air_Temp_cumsum);
          };
          if (weatherData[i].Surf_Radiation_mean == "") {
            weatherData2012surfMean.push("null");
          } else {
            weatherData2012surfMean.push(weatherData[i].Surf_Radiation_mean);
          };
          if (weatherData[i].Surf_Radiation_cumsum == "") {
            weatherData2012surfSum.push("null");
          } else {
            weatherData2012surfSum.push(weatherData[i].Surf_Radiation_cumsum);
          };
          if (weatherData[i].Wind_Velocity_mean == "") {
            weatherData2012windMean.push("null");
          } else {
            weatherData2012windMean.push(weatherData[i].Wind_Velocity_mean);
          };
          if (weatherData[i].Wind_Velocity_cumsum == "") {
            weatherData2012windSum.push("null");
          } else {
            weatherData2012windSum.push(weatherData[i].Wind_Velocity_cumsum);
          };
          break;
        default:
      }
    }
  }

  // Stream Gage Data

  var t = ["Date"];
  var t2020 = ["Date"];
  var t2021 = ["Date"];
  var water_temp = ["Water Temperature"];
  var water_temp2020 = ["2020"];
  var water_temp2021 = ["2021"];
  streamGage1Data2022 = [];
  streamGage1Data2022wtMean = ["2022"];
  streamGage1Data2022wtSum = ["2022"];
  streamGage1Data2022dchMean = ["2022"];
  streamGage1Data2022dchSum = ["2022"];
  streamGage1Data2021 = [];
  streamGage1Data2021wtMean = ["2021"];
  streamGage1Data2021wtSum = ["2021"];
  streamGage1Data2021dchMean = ["2021"];
  streamGage1Data2021dchSum = ["2021"];
  streamGage1Data2020 = [];
  streamGage1Data2020wtMean = ["2020"];
  streamGage1Data2020wtSum = ["2020"];
  streamGage1Data2020dchMean = ["2020"];
  streamGage1Data2020dchSum = ["2020"];
  streamGage1Data2019 = [];
  streamGage1Data2019wtMean = ["2019"];
  streamGage1Data2019wtSum = ["2019"];
  streamGage1Data2019dchMean = ["2019"];
  streamGage1Data2019dchSum = ["2019"];
  streamGage1Data2018 = [];
  streamGage1Data2018wtMean = ["2018"];
  streamGage1Data2018wtSum = ["2018"];
  streamGage1Data2018dchMean = ["2018"];
  streamGage1Data2018dchSum = ["2018"];
  streamGage1Data2017 = [];
  streamGage1Data2017wtMean = ["2017"];
  streamGage1Data2017wtSum = ["2017"];
  streamGage1Data2017dchMean = ["2017"];
  streamGage1Data2017dchSum = ["2017"];
  streamGage1Data2016 = [];
  streamGage1Data2016wtMean = ["2016"];
  streamGage1Data2016wtSum = ["2016"];
  streamGage1Data2016dchMean = ["2016"];
  streamGage1Data2016dchSum = ["2016"];
  streamGage1Data2015 = [];
  streamGage1Data2015wtMean = ["2015"];
  streamGage1Data2015wtSum = ["2015"];
  streamGage1Data2015dchMean = ["2015"];
  streamGage1Data2015dchSum = ["2015"];
  streamGage1Data2014 = [];
  streamGage1Data2014wtMean = ["2014"];
  streamGage1Data2014wtSum = ["2014"];
  streamGage1Data2014dchMean = ["2014"];
  streamGage1Data2014dchSum = ["2014"];
  streamGage1Data2013 = [];
  streamGage1Data2013wtMean = ["2013"];
  streamGage1Data2013wtSum = ["2013"];
  streamGage1Data2013dchMean = ["2013"];
  streamGage1Data2013dchSum = ["2013"];
  streamGage1Data2012 = [];
  streamGage1Data2012wtMean = ["2012"];
  streamGage1Data2012wtSum = ["2012"];
  streamGage1Data2012dchMean = ["2012"];
  streamGage1Data2012dchSum = ["2012"];
  streamGage1Data2011 = [];
  streamGage1Data2011wtMean = ["2011"];
  streamGage1Data2011wtSum = ["2011"];
  streamGage1Data2011dchMean = ["2011"];
  streamGage1Data2011dchSum = ["2011"];
  streamGage1Data2010 = [];
  streamGage1Data2010wtMean = ["2010"];
  streamGage1Data2010wtSum = ["2010"];
  streamGage1Data2010dchMean = ["2010"];
  streamGage1Data2010dchSum = ["2010"];

  var gage1 = {
    name: "14178000",
    wt: water_temp,
    wt2020: water_temp2020,
    wt2021: water_temp2021,
    wtM2022: streamGage1Data2022wtMean,
    wtS2022: streamGage1Data2022wtSum,
    dchM2022: streamGage1Data2022dchMean,
    dchS2022: streamGage1Data2022dchSum,
    wtM2021: streamGage1Data2021wtMean,
    wtS2021: streamGage1Data2021wtSum,
    dchM2021: streamGage1Data2021dchMean,
    dchS2021: streamGage1Data2021dchSum,
    wtM2020: streamGage1Data2020wtMean,
    wtS2020: streamGage1Data2020wtSum,
    dchM2020: streamGage1Data2020dchMean,
    dchS2020: streamGage1Data2020dchSum,
    wtM2019: streamGage1Data2019wtMean,
    wtS2019: streamGage1Data2019wtSum,
    dchM2019: streamGage1Data2019dchMean,
    dchS2019: streamGage1Data2019dchSum,
    wtM2018: streamGage1Data2018wtMean,
    wtS2018: streamGage1Data2018wtSum,
    dchM2018: streamGage1Data2018dchMean,
    dchS2018: streamGage1Data2018dchSum,
    wtM2017: streamGage1Data2017wtMean,
    wtS2017: streamGage1Data2017wtSum,
    dchM2017: streamGage1Data2017dchMean,
    dchS2017: streamGage1Data2017dchSum,
    wtM2016: streamGage1Data2016wtMean,
    wtS2016: streamGage1Data2016wtSum,
    dchM2016: streamGage1Data2016dchMean,
    dchS2016: streamGage1Data2016dchSum,
    wtM2015: streamGage1Data2015wtMean,
    wtS2015: streamGage1Data2015wtSum,
    dchM2015: streamGage1Data2015dchMean,
    dchS2015: streamGage1Data2015dchSum,
    wtM2014: streamGage1Data2014wtMean,
    wtS2014: streamGage1Data2014wtSum,
    dchM2014: streamGage1Data2014dchMean,
    dchS2014: streamGage1Data2014dchSum,
    wtM2013: streamGage1Data2013wtMean,
    wtS2013: streamGage1Data2013wtSum,
    dchM2013: streamGage1Data2013dchMean,
    dchS2013: streamGage1Data2013dchSum,
    wtM2012: streamGage1Data2012wtMean,
    wtS2012: streamGage1Data2012wtSum,
    dchM2012: streamGage1Data2012dchMean,
    dchS2012: streamGage1Data2012dchSum,
    wtM2011: streamGage1Data2011wtMean,
    wtS2011: streamGage1Data2011wtSum,
    dchM2011: streamGage1Data2011dchMean,
    dchS2011: streamGage1Data2011dchSum,
    wtM2010: streamGage1Data2010wtMean,
    wtS2010: streamGage1Data2010wtSum,
    dchM2010: streamGage1Data2010dchMean,
    dchS2010: streamGage1Data2010dchSum,
  }

  function gage1Counts(i) {
    gageID = "14178000";
    $("#gageDropdown").text("NO SANTIAM R BLW BOULDER CRK, NR DETROIT, OR");

    let streamGageData = datasets[25];
    for (let i = 0; i < streamGageData.length; i++) {
      dateGage1Reformat = streamGageData[i].date.split("-");
      yearGage1 = dateGage1Reformat[0];
      if (streamGageData[i].usgs_site == "14178000") {
        switch (yearGage1) {
          case "2022":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2022wtMean.push("null");
            } else {
              streamGage1Data2022wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2022wtSum.push("null");
            } else {
              streamGage1Data2022wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2022dchMean.push("null");
            } else {
              streamGage1Data2022dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2022dchSum.push("null");
            } else {
              streamGage1Data2022dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2021":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2021wtMean.push("null");
            } else {
              streamGage1Data2021wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2021wtSum.push("null");
            } else {
              streamGage1Data2021wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2021dchMean.push("null");
            } else {
              streamGage1Data2021dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2021dchSum.push("null");
            } else {
              streamGage1Data2021dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2020":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2020wtMean.push("null");
            } else {
              streamGage1Data2020wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2020wtSum.push("null");
            } else {
              streamGage1Data2020wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2020dchMean.push("null");
            } else {
              streamGage1Data2020dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2020dchSum.push("null");
            } else {
              streamGage1Data2020dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2019":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2019wtMean.push("null");
            } else {
              streamGage1Data2019wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2019wtSum.push("null");
            } else {
              streamGage1Data2019wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2019dchMean.push("null");
            } else {
              streamGage1Data2019dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2019dchSum.push("null");
            } else {
              streamGage1Data2019dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2018":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2018wtMean.push("null");
            } else {
              streamGage1Data2018wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2018wtSum.push("null");
            } else {
              streamGage1Data2018wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2018dchMean.push("null");
            } else {
              streamGage1Data2018dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2018dchSum.push("null");
            } else {
              streamGage1Data2018dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2017":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2017wtMean.push("null");
            } else {
              streamGage1Data2017wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2017wtSum.push("null");
            } else {
              streamGage1Data2017wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2017dchMean.push("null");
            } else {
              streamGage1Data2017dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2017dchSum.push("null");
            } else {
              streamGage1Data2017dchSum.push(streamGageData[i].Discharge_cumsum);
            };
          case "2016":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2016wtMean.push("null");
            } else {
              streamGage1Data2016wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2016wtSum.push("null");
            } else {
              streamGage1Data2016wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2016dchMean.push("null");
            } else {
              streamGage1Data2016dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2016dchSum.push("null");
            } else {
              streamGage1Data2016dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2015":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2015wtMean.push("null");
            } else {
              streamGage1Data2015wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2015wtSum.push("null");
            } else {
              streamGage1Data2015wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2015dchMean.push("null");
            } else {
              streamGage1Data2015dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2015dchSum.push("null");
            } else {
              streamGage1Data2015dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2014":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2014wtMean.push("null");
            } else {
              streamGage1Data2014wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2014wtSum.push("null");
            } else {
              streamGage1Data2014wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2014dchMean.push("null");
            } else {
              streamGage1Data2014dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2014dchSum.push("null");
            } else {
              streamGage1Data2014dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2013":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2013wtMean.push("null");
            } else {
              streamGage1Data2013wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2013wtSum.push("null");
            } else {
              streamGage1Data2013wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2013dchMean.push("null");
            } else {
              streamGage1Data2013dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2013dchSum.push("null");
            } else {
              streamGage1Data2013dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2012":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2012wtMean.push("null");
            } else {
              streamGage1Data2012wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2012wtSum.push("null");
            } else {
              streamGage1Data2012wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2012dchMean.push("null");
            } else {
              streamGage1Data2012dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2012dchSum.push("null");
            } else {
              streamGage1Data2012dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2011":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2011wtMean.push("null");
            } else {
              streamGage1Data2011wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2011wtSum.push("null");
            } else {
              streamGage1Data2011wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2011dchMean.push("null");
            } else {
              streamGage1Data2011dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2011dchSum.push("null");
            } else {
              streamGage1Data2011dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          case "2010":
            if (streamGageData[i].Water_Temp_mean == "") {
              streamGage1Data2010wtMean.push("null");
            } else {
              streamGage1Data2010wtMean.push(streamGageData[i].Water_Temp_mean);
            };
            if (streamGageData[i].Water_Temp_cumsum == "") {
              streamGage1Data2010wtSum.push("null");
            } else {
              streamGage1Data2010wtSum.push(streamGageData[i].Water_Temp_cumsum);
            };
            if (streamGageData[i].Discharge_mean == "") {
              streamGage1Data2010dchMean.push("null");
            } else {
              streamGage1Data2010dchMean.push(streamGageData[i].Discharge_mean);
            };
            if (streamGageData[i].Discharge_cumsum == "") {
              streamGage1Data2010dchSum.push("null");
            } else {
              streamGage1Data2010dchSum.push(streamGageData[i].Discharge_cumsum);
            };
            break;
          default:
        }
      }

    }

    twt = 0;
    datasets[0].forEach(function(d) {
      var USTd = new Date(d["date"])
      t.push(USTd.setHours(USTd.getHours() + 8));
      twt = 0;
      current = d;
      delete current["date"];
      if (i["name"] = "14178000") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:

            twt += +items[0];
            break;
        };

      }
      i["wt"].push(twt);
    });
    twt2020 = 0;
    datasets[21].forEach(function(d) {
      var USTd = new Date(d["date"])
      t2020.push(USTd.setHours(USTd.getHours() + 8));
      twt2020 = 0;
      current = d;
      delete current["date"];
      if (i["name"] = "14178000") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:

            twt2020 += +items[0];
            break;
        };

      }
      i["wt2020"].push(twt2020);
    });
    twt2021 = 0;
    datasets[22].forEach(function(d) {
      var USTd = new Date(d["date"])
      t2021.push(USTd.setHours(USTd.getHours() + 8));
      twt2021 = 0;
      current = d;
      delete current["date"];
      if (i["name"] = "14178000") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:

            twt2021 += +items[0];
            break;
        };

      }
      i["wt2021"].push(twt2021);
    });


  }

  function siteCounts(i) {
    let streamGageData = datasets[25];
    for (let t = 0; t < streamGageData.length; t++) {
      dateGageReformat = streamGageData[t].date.split("-");
      yearGage = dateGageReformat[0];
      if (streamGageData[t].usgs_site == i["name"]) {
        switch (yearGage) {
          case "2022":
            streamGage1Data2022.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2022wtMean.push("null");
            } else {
              streamGage1Data2022wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2022wtSum.push("null");
            } else {
              streamGage1Data2022wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2022dchMean.push("null");
            } else {
              streamGage1Data2022dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2022dchSum.push("null");
            } else {
              streamGage1Data2022dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2021":
            streamGage1Data2021.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2021wtMean.push("null");
            } else {
              streamGage1Data2021wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2021wtSum.push("null");
            } else {
              streamGage1Data2021wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2021dchMean.push("null");
            } else {
              streamGage1Data2021dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2021dchSum.push("null");
            } else {
              streamGage1Data2021dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2020":
            streamGage1Data2020.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2020wtMean.push("null");
            } else {
              streamGage1Data2020wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2020wtSum.push("null");
            } else {
              streamGage1Data2020wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2020dchMean.push("null");
            } else {
              streamGage1Data2020dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2020dchSum.push("null");
            } else {
              streamGage1Data2020dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2019":
            streamGage1Data2019.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2019wtMean.push("null");
            } else {
              streamGage1Data2019wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2019wtSum.push("null");
            } else {
              streamGage1Data2019wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2019dchMean.push("null");
            } else {
              streamGage1Data2019dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2019dchSum.push("null");
            } else {
              streamGage1Data2019dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2018":
            streamGage1Data2018.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2018wtMean.push("null");
            } else {
              streamGage1Data2018wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2018wtSum.push("null");
            } else {
              streamGage1Data2018wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2018dchMean.push("null");
            } else {
              streamGage1Data2018dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2018dchSum.push("null");
            } else {
              streamGage1Data2018dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2017":
            streamGage1Data2017.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2017wtMean.push("null");
            } else {
              streamGage1Data2017wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2017wtSum.push("null");
            } else {
              streamGage1Data2017wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2017dchMean.push("null");
            } else {
              streamGage1Data2017dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2017dchSum.push("null");
            } else {
              streamGage1Data2017dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2016":
            streamGage1Data2016.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2016wtMean.push("null");
            } else {
              streamGage1Data2016wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2016wtSum.push("null");
            } else {
              streamGage1Data2016wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2016dchMean.push("null");
            } else {
              streamGage1Data2016dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2016dchSum.push("null");
            } else {
              streamGage1Data2016dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2015":
            streamGage1Data2015.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2015wtMean.push("null");
            } else {
              streamGage1Data2015wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2015wtSum.push("null");
            } else {
              streamGage1Data2015wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2015dchMean.push("null");
            } else {
              streamGage1Data2015dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2015dchSum.push("null");
            } else {
              streamGage1Data2015dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2014":
            streamGage1Data2014.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2014wtMean.push("null");
            } else {
              streamGage1Data2014wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2014wtSum.push("null");
            } else {
              streamGage1Data2014wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2014dchMean.push("null");
            } else {
              streamGage1Data2014dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2014dchSum.push("null");
            } else {
              streamGage1Data2014dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2013":
            streamGage1Data2013.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2013wtMean.push("null");
            } else {
              streamGage1Data2013wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2013wtSum.push("null");
            } else {
              streamGage1Data2013wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2013dchMean.push("null");
            } else {
              streamGage1Data2013dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2013dchSum.push("null");
            } else {
              streamGage1Data2013dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2012":
            streamGage1Data2012.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2012wtMean.push("null");
            } else {
              streamGage1Data2012wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2012wtSum.push("null");
            } else {
              streamGage1Data2012wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2012dchMean.push("null");
            } else {
              streamGage1Data2012dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2012dchSum.push("null");
            } else {
              streamGage1Data2012dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2011":
            streamGage1Data2011.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2011wtMean.push("null");
            } else {
              streamGage1Data2011wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2011wtSum.push("null");
            } else {
              streamGage1Data2011wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2011dchMean.push("null");
            } else {
              streamGage1Data2011dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2011dchSum.push("null");
            } else {
              streamGage1Data2011dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          case "2010":
            streamGage1Data2010.push(streamGageData[t]);
            if (streamGageData[t].Water_Temp_mean == "") {
              streamGage1Data2010wtMean.push("null");
            } else {
              streamGage1Data2010wtMean.push(streamGageData[t].Water_Temp_mean);
            };
            if (streamGageData[t].Water_Temp_cumsum == "") {
              streamGage1Data2010wtSum.push("null");
            } else {
              streamGage1Data2010wtSum.push(streamGageData[t].Water_Temp_cumsum);
            };
            if (streamGageData[t].Discharge_mean == "") {
              streamGage1Data2010dchMean.push("null");
            } else {
              streamGage1Data2010dchMean.push(streamGageData[t].Discharge_mean);
            };
            if (streamGageData[t].Discharge_cumsum == "") {
              streamGage1Data2010dchSum.push("null");
            } else {
              streamGage1Data2010dchSum.push(streamGageData[t].Discharge_cumsum);
            };
            break;
          default:
        }
      }
    }
  }

  // Water sample Data
  var wstnew = ["Date"];
  var wst = ["Date"];
  var wst2016 = ["Date"];
  var wst2017 = ["Date"];
  var wst2018 = ["Date"];
  var wst2019 = ["Date"];
  var wstt = ["Date"];
  var wstt2016 = ["Date"];
  var wstt2017 = ["Date"];
  var wstt2018 = ["Date"];
  var wstt2019 = ["Date"];
  var wsnt = ["Date"];
  var wsnt2016 = ["Date"];
  var wsnt2017 = ["Date"];
  var wsnt2018 = ["Date"];
  var wsnt2019 = ["Date"];
  var algae = ["Algae"];
  var algae2016 = ["2016"];
  var algae2017 = ["2017"];
  var algae2018 = ["2018"];
  var algae2019 = ["2019"];
  var toxin = ["Toxins"];
  var toxin2013 = ["2013"];
  var toxin2014 = ["2014"];
  var toxin2015 = ["2015"];
  var toxin2016 = ["2016"];
  var toxin2017 = ["2017"];
  var toxin2018 = ["2018"];
  var toxin2019 = ["2019"];
  var nitrate = ["Total Nitrate"];
  var nitrate2016 = ["2016"];
  var nitrate2017 = ["2017"];
  var nitrate2018 = ["2018"];
  var nitrate2019 = ["2019"];

  var sampleLoc1 = {
    name: "Log Boom",
    a: algae,
    a2016: algae2016,
    a2017: algae2017,
    a2018: algae2018,
    a2019: algae2019,
    t: toxin,
    t2013: toxin2013,
    t2014: toxin2014,
    t2015: toxin2015,
    t2016: toxin2016,
    t2017: toxin2017,
    t2018: toxin2018,
    t2019: toxin2019,
    n: nitrate,
    n2016: nitrate2016,
    n2017: nitrate2017,
    n2018: nitrate2018,
    n2019: nitrate2019,
  }

  function sample1Counts(i) {
    // algae data
    ta = 0;
    datasets[2].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst.push(USTd.setHours(USTd.getHours() + 8));
      ta = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta += +items[0];
            break;
        };

      }
      i["a"].push(ta);
    });
    ta2016 = 0;
    datasets[9].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2016.push(USTd.setHours(USTd.getHours() + 8));
      ta2016 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2016 += +items[0];
            break;
        };

      }
      i["a2016"].push(ta2016);
    });
    ta2017 = 0;
    datasets[10].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2017.push(USTd.setHours(USTd.getHours() + 8));
      ta2017 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2017 += +items[0];
            break;
        };

      }
      i["a2017"].push(ta2017);
    });
    ta2018 = 0;
    datasets[11].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2018.push(USTd.setHours(USTd.getHours() + 8));
      ta2018 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2018 += +items[0];
            break;
        };

      }
      i["a2018"].push(ta2018);
    });
    ta2019 = 0;
    datasets[12].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2019.push(USTd.setHours(USTd.getHours() + 8));
      ta2019 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2019 += +items[0];
            break;
        };

      }
      i["a2019"].push(ta2019);
    });
    // toxin data
    tt = 0;
    datasets[6].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt.push(USTd.setHours(USTd.getHours() + 8));
      tt = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt += +items[0];
            break;
        };

      }
      i["t"].push(tt);
    });
    tt2016 = 0;
    datasets[13].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2016.push(USTd.setHours(USTd.getHours() + 8));
      tt2016 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2016 += +items[0];
            break;
        };

      }
      i["t2016"].push(tt2016);
    });
    tt2017 = 0;
    datasets[14].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2017.push(USTd.setHours(USTd.getHours() + 8));
      tt2017 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2017 += +items[0];
            break;
        };

      }
      i["t2017"].push(tt2017);
    });
    tt2018 = 0;
    datasets[15].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2018.push(USTd.setHours(USTd.getHours() + 8));
      tt2018 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2018 += +items[0];
            break;
        };

      }
      i["t2018"].push(tt2018);
    });
    tt2019 = 0;
    datasets[16].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2019.push(USTd.setHours(USTd.getHours() + 8));
      tt2019 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2019 += +items[0];
            break;
        };

      }
      i["t2019"].push(tt2019);
    });
    // nitrate data
    tn = 0;
    datasets[7].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt.push(USTd.setHours(USTd.getHours() + 8));
      tn = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn += +items[0];
            break;
        };

      }
      i["n"].push(tn);
    });
    tn2016 = 0;
    datasets[17].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2016.push(USTd.setHours(USTd.getHours() + 8));
      tn2016 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2016 += +items[0];
            break;
        };

      }
      i["n2016"].push(tn2016);
    });
    tn2017 = 0;
    datasets[18].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2017.push(USTd.setHours(USTd.getHours() + 8));
      tn2017 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2017 += +items[0];
            break;
        };

      }
      i["n2017"].push(tn2017);
    });
    tn2018 = 0;
    datasets[19].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2018.push(USTd.setHours(USTd.getHours() + 8));
      tn2018 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2018 += +items[0];
            break;
        };

      }
      i["n2018"].push(tn2018);
    });
    tn2019 = 0;
    datasets[20].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2019.push(USTd.setHours(USTd.getHours() + 8));
      tn2019 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2019 += +items[0];
            break;
        };

      }
      i["n2019"].push(tn2019);
    });
  }

  function sampleSiteCounts(i) {
    // algae data
    ta = 0;
    datasets[2].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst.push(USTd.setHours(USTd.getHours() + 8));
      ta = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              ta += +items[0];
              break;
          };

        });
        //
      }
      i["a"].push(ta);
    });
    ta2016 = 0;
    datasets[9].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2016.push(USTd.setHours(USTd.getHours() + 8));
      ta2016 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2016 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              ta2016 += +items[0];
              break;
          };

        });
        //
      }
      i["a2016"].push(ta2016);
    });
    ta2017 = 0;
    datasets[10].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2017.push(USTd.setHours(USTd.getHours() + 8));
      ta2017 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2017 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              ta2017 += +items[0];
              break;
          };

        });
        //
      }
      i["a2017"].push(ta2017);
    });
    ta2018 = 0;
    datasets[11].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2018.push(USTd.setHours(USTd.getHours() + 8));
      ta2018 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2018 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              ta2018 += +items[0];
              break;
          };

        });
        //
      }
      i["a2018"].push(ta2018);
    });
    ta2019 = 0;
    datasets[12].forEach(function(d) {
      var USTd = new Date(d["t"])
      wst2019.push(USTd.setHours(USTd.getHours() + 8));
      ta2019 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            ta2019 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              ta2019 += +items[0];
              break;
          };

        });
        //
      }
      i["a2019"].push(ta2019);
    });
    // toxin data
    tt = 0;
    datasets[6].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt.push(USTd.setHours(USTd.getHours() + 8));
      tt = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tt += +items[0];
              break;
          };

        });
        //
      }
      i["t"].push(tt);
    });
    tt2016 = 0;
    datasets[13].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2016.push(USTd.setHours(USTd.getHours() + 8));
      tt2016 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2016 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tt2016 += +items[0];
              break;
          };

        });
        //
      }
      i["t2016"].push(tt2016);
    });
    tt2017 = 0;
    datasets[14].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2017.push(USTd.setHours(USTd.getHours() + 8));
      tt2017 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2017 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tt2017 += +items[0];
              break;
          };

        });
        //
      }
      i["t2017"].push(tt2017);
    });
    tt2018 = 0;
    datasets[15].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2018.push(USTd.setHours(USTd.getHours() + 8));
      tt2018 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2018 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tt2018 += +items[0];
              break;
          };

        });
        //
      }
      i["t2018"].push(tt2018);
    });
    tt2019 = 0;
    datasets[16].forEach(function(d) {
      var USTd = new Date(d["t"])
      wstt2019.push(USTd.setHours(USTd.getHours() + 8));
      tt2019 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tt2019 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tt2019 += +items[0];
              break;
          };

        });
        //
      }
      i["t2019"].push(tt2019);
    });
    // nitrate data
    tn = 0;
    datasets[7].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt.push(USTd.setHours(USTd.getHours() + 8));
      tn = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tn += +items[0];
              break;
          };

        });
        //
      }
      i["n"].push(tn);
    });
    tn2016 = 0;
    datasets[17].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2016.push(USTd.setHours(USTd.getHours() + 8));
      tn2016 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2016 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tn2016 += +items[0];
              break;
          };

        });
        //
      }
      i["n2016"].push(tn2016);
    });
    tn2017 = 0;
    datasets[18].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2017.push(USTd.setHours(USTd.getHours() + 8));
      tn2017 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2017 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tn2017 += +items[0];
              break;
          };

        });
        //
      }
      i["n2017"].push(tn2017);
    });
    tn2018 = 0;
    datasets[19].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2018.push(USTd.setHours(USTd.getHours() + 8));
      tn2018 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2018 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tn2018 += +items[0];
              break;
          };

        });
        //
      }
      i["n2018"].push(tn2018);
    });
    tn2019 = 0;
    datasets[20].forEach(function(d) {
      var USTd = new Date(d["t"])
      wsnt2019.push(USTd.setHours(USTd.getHours() + 8));
      tn2019 = 0;
      current = d;
      delete current["t"];
      if (i["name"] = "Log Boom") {
        d = current[i["name"]];
        if (d == undefined) {
          d = "0"
        };
        items = d.split("-");
        switch (items.length) {
          case 1:
            tn2019 += +items[0];
            break;
        };

      } else {

        Object.values(current).forEach(function(d) {
          if (d == undefined) {
            d = "0"
          };
          items = d.split("-");
          switch (items.length) {
            case 1:
              tn2019 += +items[0];
              break;
          };

        });
        //
      }
      i["n2019"].push(tn2019);
    });
  }

  function style(feature) {
    return {
      fillOpacity: 0.4,
      weight: 1,
      opacity: 1,
      color: '#b4b4b4',
      dashArray: '3'
    };

  }

  function sampleStyle(feature) {
    return {
      fillOpacity: 0.4,
      weight: 1,
      opacity: 1,
      color: '#b4b4b4',
      dashArray: '3'
    };

  }

  function weatherStyle(feature) {
    return {
      fillOpacity: 0.4,
      weight: 1,
      opacity: 1,
      color: '#b4b4b4',
      dashArray: '3'
    };

  }


  function highlightFeature(e) {
    // e indicates the current event
    var layer = e.target; //the target capture the object which the event associates with
    layer.setStyle({
      weight: 4,
      opacity: 0.8,
      color: '#e3e3e3',
      fillColor: '#00ffd9',
      fillOpacity: 0.1
    });
    // bring the layer to the front.
    layer.bringToFront();
  }

  // 3.2.2 zoom to the highlighted feature when the mouse is clicking onto it.
  function zoomToFeature(e) {
    // mymap.fitBounds(e.target.getBounds());
    L.DomEvent.stopPropagation(e);
    // $("#hint").text("Click here to for State trend.");


    var t = ["Date"];
    var t2020 = ["Date"];
    var t2021 = ["Date"];
    var water_temp = ["Water Temperature"];
    var water_temp2020 = ["2020"];
    var water_temp2021 = ["2021"];
    streamGage1Data2022 = [];
    streamGage1Data2022wtMean = ["2022"];
    streamGage1Data2022wtSum = ["2022"];
    streamGage1Data2022dchMean = ["2022"];
    streamGage1Data2022dchSum = ["2022"];
    streamGage1Data2021 = [];
    streamGage1Data2021wtMean = ["2021"];
    streamGage1Data2021wtSum = ["2021"];
    streamGage1Data2021dchMean = ["2021"];
    streamGage1Data2021dchSum = ["2021"];
    streamGage1Data2020 = [];
    streamGage1Data2020wtMean = ["2020"];
    streamGage1Data2020wtSum = ["2020"];
    streamGage1Data2020dchMean = ["2020"];
    streamGage1Data2020dchSum = ["2020"];
    streamGage1Data2019 = [];
    streamGage1Data2019wtMean = ["2019"];
    streamGage1Data2019wtSum = ["2019"];
    streamGage1Data2019dchMean = ["2019"];
    streamGage1Data2019dchSum = ["2019"];
    streamGage1Data2018 = [];
    streamGage1Data2018wtMean = ["2018"];
    streamGage1Data2018wtSum = ["2018"];
    streamGage1Data2018dchMean = ["2018"];
    streamGage1Data2018dchSum = ["2018"];
    streamGage1Data2017 = [];
    streamGage1Data2017wtMean = ["2017"];
    streamGage1Data2017wtSum = ["2017"];
    streamGage1Data2017dchMean = ["2017"];
    streamGage1Data2017dchSum = ["2017"];
    streamGage1Data2016 = [];
    streamGage1Data2016wtMean = ["2016"];
    streamGage1Data2016wtSum = ["2016"];
    streamGage1Data2016dchMean = ["2016"];
    streamGage1Data2016dchSum = ["2016"];
    streamGage1Data2015 = [];
    streamGage1Data2015wtMean = ["2015"];
    streamGage1Data2015wtSum = ["2015"];
    streamGage1Data2015dchMean = ["2015"];
    streamGage1Data2015dchSum = ["2015"];
    streamGage1Data2014 = [];
    streamGage1Data2014wtMean = ["2014"];
    streamGage1Data2014wtSum = ["2014"];
    streamGage1Data2014dchMean = ["2014"];
    streamGage1Data2014dchSum = ["2014"];
    streamGage1Data2013 = [];
    streamGage1Data2013wtMean = ["2013"];
    streamGage1Data2013wtSum = ["2013"];
    streamGage1Data2013dchMean = ["2013"];
    streamGage1Data2013dchSum = ["2013"];
    streamGage1Data2012 = [];
    streamGage1Data2012wtMean = ["2012"];
    streamGage1Data2012wtSum = ["2012"];
    streamGage1Data2012dchMean = ["2012"];
    streamGage1Data2012dchSum = ["2012"];
    streamGage1Data2011 = [];
    streamGage1Data2011wtMean = ["2011"];
    streamGage1Data2011wtSum = ["2011"];
    streamGage1Data2011dchMean = ["2011"];
    streamGage1Data2011dchSum = ["2011"];
    streamGage1Data2010 = [];
    streamGage1Data2010wtMean = ["2010"];
    streamGage1Data2010wtSum = ["2010"];
    streamGage1Data2010dchMean = ["2010"];
    streamGage1Data2010dchSum = ["2010"];

    gageID = e.target.feature.properties.usgs_site;
    var siteSelect = {
      name: gageID,
      wt: water_temp,
      wt2020: water_temp2020,
      wt2021: water_temp2021,
      wtM2022: streamGage1Data2022wtMean,
      wtS2022: streamGage1Data2022wtSum,
      dchM2022: streamGage1Data2022dchMean,
      dchS2022: streamGage1Data2022dchSum,
      wtM2021: streamGage1Data2021wtMean,
      wtS2021: streamGage1Data2021wtSum,
      dchM2021: streamGage1Data2021dchMean,
      dchS2021: streamGage1Data2021dchSum,
      wtM2020: streamGage1Data2020wtMean,
      wtS2020: streamGage1Data2020wtSum,
      dchM2020: streamGage1Data2020dchMean,
      dchS2020: streamGage1Data2020dchSum,
      wtM2019: streamGage1Data2019wtMean,
      wtS2019: streamGage1Data2019wtSum,
      dchM2019: streamGage1Data2019dchMean,
      dchS2019: streamGage1Data2019dchSum,
      wtM2018: streamGage1Data2018wtMean,
      wtS2018: streamGage1Data2018wtSum,
      dchM2018: streamGage1Data2018dchMean,
      dchS2018: streamGage1Data2018dchSum,
      wtM2017: streamGage1Data2017wtMean,
      wtS2017: streamGage1Data2017wtSum,
      dchM2017: streamGage1Data2017dchMean,
      dchS2017: streamGage1Data2017dchSum,
      wtM2016: streamGage1Data2016wtMean,
      wtS2016: streamGage1Data2016wtSum,
      dchM2016: streamGage1Data2016dchMean,
      dchS2016: streamGage1Data2016dchSum,
      wtM2015: streamGage1Data2015wtMean,
      wtS2015: streamGage1Data2015wtSum,
      dchM2015: streamGage1Data2015dchMean,
      dchS2015: streamGage1Data2015dchSum,
      wtM2014: streamGage1Data2014wtMean,
      wtS2014: streamGage1Data2014wtSum,
      dchM2014: streamGage1Data2014dchMean,
      dchS2014: streamGage1Data2014dchSum,
      wtM2013: streamGage1Data2013wtMean,
      wtS2013: streamGage1Data2013wtSum,
      dchM2013: streamGage1Data2013dchMean,
      dchS2013: streamGage1Data2013dchSum,
      wtM2012: streamGage1Data2012wtMean,
      wtS2012: streamGage1Data2012wtSum,
      dchM2012: streamGage1Data2012dchMean,
      dchS2012: streamGage1Data2012dchSum,
      wtM2011: streamGage1Data2011wtMean,
      wtS2011: streamGage1Data2011wtSum,
      dchM2011: streamGage1Data2011dchMean,
      dchS2011: streamGage1Data2011dchSum,
      wtM2010: streamGage1Data2010wtMean,
      wtS2010: streamGage1Data2010wtSum,
      dchM2010: streamGage1Data2010dchMean,
      dchS2010: streamGage1Data2010dchSum,
    }

    siteCounts(siteSelect);

    chart.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    chart2.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    h20SumChart.load({
      unload: true,
      columns: [siteSelect.wtS2022, siteSelect.wtS2021, siteSelect.wtS2020],
    });
    dchMeanChart.load({
      unload: true,
      columns: [siteSelect.dchM2022, siteSelect.dchM2021, siteSelect.dchM2020],
    });
    dchSumChart.load({
      unload: true,
      columns: [siteSelect.dchS2022, siteSelect.dchS2021, siteSelect.dchS2020],
    });
    $("#gage-chart > svg > g:nth-child(2)").hide();
    $("#gageDropdown").text(e.target.feature.properties.site_name);

    // $("#deck-2 > div.col-lg-2 > center > div:nth-child(4) > label").css('color', 'white');
    $("#gage2019").css('color', 'white');
    $("#gage2018").css('color', 'white');
    $("#gage2017").css('color', 'white');
    $("#gage2016").css('color', 'white');
    $("#gage2015").css('color', 'white');
    $("#gage2014").css('color', 'white');
    $("#gage2013").css('color', 'white');
    $("#gage2012").css('color', 'white');
    $("#gage2011").css('color', 'white');
    $("#gage2010").css('color', 'white');

  }

  function sampleZoomToFeature(e) {
    // mymap.fitBounds(e.target.getBounds());
    L.DomEvent.stopPropagation(e);
    // $("#hint").text("Click here to for State trend.");


    // Water sample Data
    var wst = ["Date"];
    var wst2016 = ["Date"];
    var wst2017 = ["Date"];
    var wst2018 = ["Date"];
    var wst2019 = ["Date"];
    var wstt = ["Date"];
    var wstt2016 = ["Date"];
    var wstt2017 = ["Date"];
    var wstt2018 = ["Date"];
    var wstt2019 = ["Date"];
    var wsnt = ["Date"];
    var wsnt2016 = ["Date"];
    var wsnt2017 = ["Date"];
    var wsnt2018 = ["Date"];
    var wsnt2019 = ["Date"];
    var algae = ["Algae"];
    var algae2016 = ["2016"];
    var algae2017 = ["2017"];
    var algae2018 = ["2018"];
    var algae2019 = ["2019"];
    var toxin = ["Toxins"];
    var toxin2016 = ["2016"];
    var toxin2017 = ["2017"];
    var toxin2018 = ["2018"];
    var toxin2019 = ["2019"];
    var nitrate = ["Total Nitrate"];
    var nitrate2016 = ["2016"];
    var nitrate2017 = ["2017"];
    var nitrate2018 = ["2018"];
    var nitrate2019 = ["2019"];

    var sampleLoc = {
      name: e.target.feature.properties.site,
      a: algae,
      a2016: algae2016,
      a2017: algae2017,
      a2018: algae2018,
      a2019: algae2019,
      t: toxin,
      t2016: toxin2016,
      t2017: toxin2017,
      t2018: toxin2018,
      t2019: toxin2019,
      n: nitrate,
      n2016: nitrate2016,
      n2017: nitrate2017,
      n2018: nitrate2018,
      n2019: nitrate2019,
    }


    sampleSiteCounts(sampleLoc);


    sampleSubChart.load({
      unload: true,
      columns: [sampleLoc.a2019, sampleLoc.a2018, sampleLoc.a2017],
    });
    sampleChart.load({
      unload: true,
      columns: [sampleLoc.a2019, sampleLoc.a2018, sampleLoc.a2017],
    });
    toxinChart.load({
      unload: true,
      columns: [sampleLoc.t2019, sampleLoc.t2018, sampleLoc.t2017],
    });
    nitrateChart.load({
      unload: true,
      columns: [sampleLoc.n2019, sampleLoc.n2018, sampleLoc.n2017],
    });

    $("#sample2016").css('color', 'white');

    $("#sampleDropdown").text(e.target.feature.properties.site);
  }


  // 3.2.3 reset the hightlighted feature when the mouse is out of its region.
  function resetHighlight(e) {
    county.resetStyle(e.target);

  }

  // 3.3 add these event the layer obejct.
  function onEachFeature(feature, layer) {
    layer.on({
        // mouseover: highlightFeature,
        click: zoomToFeature,
        // mouseout: resetHighlight
      }),
      layer.bindTooltip(feature.properties.site_name, {
        className: 'feature-label',
        permanent: false,
        sticky: true,
        direction: 'auto'
      });
  }
  // 3.3 add these event the layer obejct.
  function sampleOnEachFeature(feature, layer) {
    layer.on({
        // mouseover: highlightFeature,
        click: sampleZoomToFeature,
        // mouseout: resetHighlight
      }),
      layer.bindTooltip(feature.properties.site, {
        className: 'feature-label',
        permanent: false,
        sticky: true,
        direction: 'auto'
      });
  }
  // 3.3 add these event the layer obejct.
  function weatherOnEachFeature(feature, layer) {
    layer.on({
        // mouseover: highlightFeature,
        // click: sampleZoomToFeature,
        // mouseout: resetHighlight
      }),
      layer.bindTooltip(feature.properties.site, {
        className: 'feature-label',
        permanent: false,
        sticky: true,
        direction: 'auto'
      });
  }

  // Add geojson layers
  var sites = new L.GeoJSON(datasets[1], {
    style: style,
    onEachFeature: onEachFeature,
    // onEachFeature: function(feature, layer) {
    //   layer.bindPopup('<b>Site Name: </b>' + feature.properties.usgs_site)
    // },
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'map fas fa-tachometer-alt blinking',
        })
      });
    },
  });

  var sampleSites = new L.GeoJSON(datasets[3], {
    style: sampleStyle,
    onEachFeature: sampleOnEachFeature,
    // onEachFeature: function(feature, layer) {
    //   layer.bindPopup('<b>Site Name: </b>' + feature.properties.usgs_site)
    // },

    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'map fas fa-vials blinking',
        })
      });
    },
  });

  var weatherSites = new L.GeoJSON(datasets[8], {
    style: weatherStyle,
    onEachFeature: weatherOnEachFeature,
    // onEachFeature: function(feature, layer) {
    //   layer.bindPopup('<b>Site Name: </b>' + feature.properties.usgs_site)
    // },

    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'map fas fa-cloud-sun-rain blinking',
        })
      });
    },
  });

  // Set intial functions
  gage1Counts(gage1);
  sample1Counts(sampleLoc1);
  varsCounts(weatherVars);
  nowCastCounts(nowCastVars);

  chartColor = 'white'
  // Padding settings
  var padTop = 10;
  var padRight = 30;
  var padLeft = 70;
  // Stream gage charts
  // stream gage subchart
  chart = c3.generate({
    size: {
      height: 250,
    },
    data: {
      x: "Date",
      columns: [
        t, gage1.wtM2022, gage1.wtM2021, gage1.wtM2020
      ],
      onclick: function(d, i) {
        console.log("onclick", d, i);
      },

      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    subchart: {
      show: true,
      axis: {
        x: {
          show: false
        }
      },
      size: {
        height: 15
      },
      onbrush: function(d) {
        chart2.zoom(chart.zoom());
        h20SumChart.zoom(chart.zoom());
        dchMeanChart.zoom(chart.zoom());
        dchSumChart.zoom(chart.zoom());
      },
    },
    padding: {
      // bottom: 10,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        extent: [5, 10],
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
    },
    zoom: {
      // rescale: true,+
      enabled: true,
      type: "scroll",
      extent: [1580832000000, 1603724400000],
      onzoom: function(d) {
        chart2.zoom(chart.zoom());
        h20SumChart.zoom(chart.zoom());
        dchMeanChart.zoom(chart.zoom());
        dchSumChart.zoom(chart.zoom());
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      enabled: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#gage-chart"
  });
  $("#gage-chart > svg > g:nth-child(2)").hide();
  var stroke2022 = chart.color('2022');
  $("#gage2022").css('color', stroke2022);
  var stroke2021 = chart.color('2021');
  $("#gage2021").css('color', stroke2021);
  var stroke2020 = chart.color('2020');
  $("#gage2020").css('color', stroke2020);
  // mean water temp
  chart2 = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [t, gage1.wtM2022, gage1.wtM2021, gage1.wtM2020],
      // onmouseover: annualUpdate,
      type: 'spline',
      onclick: function(d, i) {
        console.log("onclick", d, i);
      },
    },
    subchart: {
      show: false,
      axis: {
        x: {
          show: false
        }
      },
      size: {
        height: 15
      },
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      // bottom: 10,
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        },
      },
      y: {
        label: {
          text: 'mean water temp (deg C)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),
          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    zoom: {
      // enabled: true,
      // type: "scroll",
      // onzoom: function(d) {
      //   chart.zoom(chart2.zoom());
      // }
    },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
      position: 'inset',
      inset: {
        anchor: 'top-right',
        x: 20,
        y: 10,
        step: 11
      }
    },
    line: {
      connectNull: true
    },
    bindto: "#gage-chart2"
  });
  var h20SumChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [t, gage1.wtS2022, gage1.wtS2021, gage1.wtS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'cumulative sum water temp (deg C)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#h20Sum-chart"
  });
  var dchMeanChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [t, gage1.dchM2022, gage1.dchM2021, gage1.dchM2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'mean water discharge (cu/sec)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#dchMean-chart"
  });
  var dchSumChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [t, gage1.dchS2022, gage1.dchS2021, gage1.dchS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'cumulative sum water discharge (cu/sec)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#dchSum-chart"
  });

  // sample algae chart
  sampleSubChart = c3.generate({
    size: {
      height: 250,

    },
    data: {
      x: "Date",
      columns: [wst2016, sampleLoc1.a2019, sampleLoc1.a2018, sampleLoc1.a2017],
      type: 'scatter',
    },
    color: {
      // pattern: [chartColor]
    },
    subchart: {
      show: true,
      axis: {
        x: {
          show: false
        }
      },
      size: {
        height: 15
      },
      onbrush: function(d) {
        sampleChart.zoom(sampleSubChart.zoom());
        toxinChart.zoom(sampleSubChart.zoom());
        nitrateChart.zoom(sampleSubChart.zoom());
      }
    },
    padding: {
      // bottom: 10,
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        },
      },
      y: {
        label: {
          text: 'Biovolume (um3\mL)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),
          count: 5,
        }
      }
    },
    point: {
      r: 3,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    zoom: {
      // rescale: true,+
      enabled: true,
      type: "scroll",
      onzoom: function(d) {
        sampleChart.zoom(sampleSubChart.zoom());
        toxinChart.zoom(sampleSubChart.zoom());
        nitrateChart.zoom(sampleSubChart.zoom());
      }
    },
    tooltip: {
      linked: true,
    },
    legend: {
      enabled: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#sampleSub-chart"
  });
  $("#sampleSub-chart > svg > g:nth-child(2)").hide();
  var stroke2019 = sampleSubChart.color('2019');
  $("#sample2019").css('color', stroke2019);
  var stroke2018 = sampleSubChart.color('2018');
  $("#sample2018").css('color', stroke2018);
  var stroke2017 = sampleSubChart.color('2017');
  $("#sample2017").css('color', stroke2017);
  // sample algae chart
  sampleChart = c3.generate({
    size: {
      height: 220,

    },
    data: {
      x: "Date",
      columns: [wst2016, sampleLoc1.a2019, sampleLoc1.a2018, sampleLoc1.a2017],
      type: 'scatter',
    },
    color: {
      // pattern: [chartColor]
    },
    // subchart: {
    //   show: true,
    //   axis: {
    //     x: {
    //       show: false
    //     }
    //   },
    //   size: {
    //     height: 15
    //   },
    //   onbrush: function(d) {
    //     toxinChart.zoom(sampleChart.zoom());
    //     nitrateChart.zoom(sampleChart.zoom());
    //   }
    // },
    padding: {
      // bottom: 10,
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Biovolume (um3\mL)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),
          count: 5,
        }
      }
    },
    point: {
      r: 7,
      focus: {
        expand: {
          enabled: true
        }
      }
    },
    // zoom: {
    //   // rescale: true,+
    //   enabled: true,
    //   type: "scroll",
    //   onzoom: function(d) {
    //     toxinChart.zoom(sampleChart.zoom());
    //     nitrateChart.zoom(sampleChart.zoom());
    //   }
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#sample-chart"
  });
  // toxin chart
  toxinChart = c3.generate({
    size: {
      height: 220,

    },
    data: {
      x: "Date",
      columns: [wst2016, sampleLoc1.t2019, sampleLoc1.t2018, sampleLoc1.t2017],
      type: 'scatter',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Microcystin observed (ppb)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        // tick: {
        //   format: d3.format(".2s"),
        //   count: 5,
        // }
      }
    },
    point: {
      r: 7,
      focus: {
        expand: {
          enabled: true
        }
      }
    },
    // zoom: {
    //   enabled: true,
    //   type: "scroll",
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#toxin-chart"
  });
  // toxin chart
  nitrateChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wst2016, sampleLoc1.n2019, sampleLoc1.n2018, sampleLoc1.n2017],
      type: 'scatter',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Total nitrates observed (mg/L)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        // tick: {
        //   format: d3.format(".2s"),
        //   count: 5,
        // }
      }
    },
    point: {
      r: 7,
      focus: {
        expand: {
          enabled: true
        }
      }
    },
    // zoom: {
    //   enabled: true,
    //   type: "scroll",
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#nitrate-chart"
  });
  // weather chart
  precipSubChart = c3.generate({
    size: {
      height: 250,

    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.pcM2022, weatherVars.pcM2021, weatherVars.pcM2020],
      type: 'spline',
      onclick: function(d, i) {
        console.log("onclick", d, i);
      },
    },
    // color: {
    //   pattern: [chartColor]
    // },
    subchart: {
      show: true,
      axis: {
        x: {
          show: false
        }
      },
      size: {
        height: 15
      },
      onbrush: function(d) {
        precipChart.zoom(precipSubChart.zoom());
        aitTempChart.zoom(precipSubChart.zoom());
        surfChart.zoom(precipSubChart.zoom());
        windChart.zoom(precipSubChart.zoom());
      },
    },

    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Avg. precipitation (mL)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    zoom: {
      // rescale: true,+
      enabled: true,
      type: "scroll",
      onzoom: function(d) {
        precipChart.zoom(precipSubChart.zoom());
        aitTempChart.zoom(precipSubChart.zoom());
        surfChart.zoom(precipSubChart.zoom());
        windChart.zoom(precipSubChart.zoom());
      }
    },
    tooltip: {
      linked: true,
    },
    legend: {
      enabled: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#precipSub-chart"
  });
  $("#precipSub-chart > svg > g:nth-child(2)").hide();
  var stroke2022 = precipSubChart.color('2022');
  $("#weather2022").css('color', stroke2022);
  var stroke2021 = precipSubChart.color('2021');
  $("#weather2021").css('color', stroke2021);
  var stroke2020 = precipSubChart.color('2020');
  $("#weather2020").css('color', stroke2020);

  // weather chart
  precipChart = c3.generate({
    size: {
      height: 220,

    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.pcM2022, weatherVars.pcM2021, weatherVars.pcM2020],
      type: 'spline',
    },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Avg. precipitation (mL)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   // rescale: true,+
    //   enabled: true,
    //   type: "scroll",
    //   onzoom: function(d) {
    //     aitTempChart.zoom(precipChart.zoom());
    //     // step();
    //   }
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#precip-chart"
  });
  // Air Temp Chart
  aitTempChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.atempM2022, weatherVars.atempM2021, weatherVars.atempM2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Avg. air temp (deg C)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#airTemp-chart"
  });
  // Surface downward shortwave radiation Chart
  surfChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.surfM2022, weatherVars.surfM2021, weatherVars.surfM2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Surface radiation (W/m^2)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#surf-chart"
  });
  // wind velocity chart
  windChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.windM2022, weatherVars.windM2021, weatherVars.windM2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Wind velocity (m/s)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#wind-chart"
  });
  precipSumSubChart = c3.generate({
    size: {
      height: 250,

    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.pcS2022, weatherVars.pcS2021, weatherVars.pcS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    subchart: {
      show: true,
      axis: {
        x: {
          show: false
        }
      },
      size: {
        height: 15
      },
      onbrush: function(d) {
        precipSumChart.zoom(precipSumSubChart.zoom());
        aitTempSumChart.zoom(precipSumSubChart.zoom());
        surfSumChart.zoom(precipSumSubChart.zoom());
        windSumChart.zoom(precipSumSubChart.zoom());
      },
    },

    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Avg. precipitation (mL)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    zoom: {
      // rescale: true,+
      enabled: true,
      type: "scroll",
      onzoom: function(d) {
        precipSumChart.zoom(precipSumSubChart.zoom());
        aitTempSumChart.zoom(precipSumSubChart.zoom());
        surfSumChart.zoom(precipSumSubChart.zoom());
        windSumChart.zoom(precipSumSubChart.zoom());
      }
    },
    tooltip: {
      linked: true,
    },
    legend: {
      enabled: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#precipSumSub-chart"
  });
  $("#precipSumSub-chart > svg > g:nth-child(2)").hide();
  // Precipitation Cum Sum Chart
  precipSumChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.pcS2022, weatherVars.pcS2021, weatherVars.pcS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Mean precip. (deg C)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#precipSum-chart"
  });
  // Air temp cum sum chart
  aitTempSumChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.atempS2022, weatherVars.atempS2021, weatherVars.atempS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Mean air temp. (mL)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#airTempSum-chart"
  });
  // Surface downward shortwave radiation cum sum chart
  surfSumChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.surfS2022, weatherVars.surfS2021, weatherVars.surfS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Surface radiation (W/m^2)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#surfSum-chart"
  });
  // wind velocity cum sum chart
  windSumChart = c3.generate({
    size: {
      height: 220,
    },
    data: {
      x: "Date",
      columns: [wt, weatherVars.windS2022, weatherVars.windS2021, weatherVars.windS2020],
      type: 'spline',
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: padRight,
      left: padLeft,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20
        }
      },
      y: {
        label: {
          text: 'Wind velocity (m/s)',
          position: 'outer-middle'
        },
        min: 0,
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".2s"),

          count: 5,
          // values: [0,5000,10000,15000]
        }
      }
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 10
        }
      }
    },
    // zoom: {
    //   enabled: {
    //     type: "drag"
    //   },
    // },
    tooltip: {
      linked: true,
    },
    legend: {
      show: false,
    },
    line: {
      connectNull: true
    },
    bindto: "#windSum-chart"
  });


  // CyAN Charts
  var cyan = ['Probability of a bloom'];
  var cyanLast = 100 * parseFloat(bloom_p.slice(-1));
  var noCyanLast = 100 - cyanLast;
  var lastModelAcc = 100 * model_accuracy.slice(-1);
  lastModelAccOther = 1 - lastModelAcc;
  var nocyan = ['Probability of no bloom'];
  var currentNowCastDate = nct.slice(-1);
  var previousNowCastDate;
  // Previous Forecast Donut
  var donutChart = c3.generate({
    data: {
      columns: [
        [cyan, cyanLast],
        [nocyan, noCyanLast],
      ],
      type: 'donut',
      onclick: function(d, i) {
        console.log("onclick", d, i);
      },
      onmouseover: function(d, i) {
        console.log("onmouseover", d, i);
      },
      onmouseout: function(d, i) {
        console.log("onmouseout", d, i);
      }
    },
    tooltip: {
      position: function(data, width, height, element) {
        return {
          top: 0,
          left: 20
        };
      }
    },
    color: {
      pattern: ['#17e8ce', '#01a2ff']
    },
    legend: {
      show: false
    },
    donut: {
      // title: lastModelAcc + "% Observed Bloom area",
      title: lastModelAcc,
      width: 85,
    },
    bindto: "#donut-chart"
  });
  $("#donut-chart > svg > g:nth-child(2) > g.c3-chart > g.c3-chart-arcs > text").attr("data-toggle", "tooltipDonut1");
  $("#donut-chart > svg > g:nth-child(2) > g.c3-chart > g.c3-chart-arcs > text").attr("title", "% Observed Bloom Area");
  $(document).ready(function(){
    $('[data-toggle="tooltipDonut1"]').tooltip();
  });

  // Historical Expectation Donut
  var donutChart2 = c3.generate({
    data: {
      columns: [
        [cyan, cyanLast],
        [nocyan, noCyanLast],
      ],
      type: 'donut',
      onclick: function(d, i) {
        console.log("onclick", d, i);
      },
      onmouseover: function(d, i) {
        console.log("onmouseover", d, i);
      },
      onmouseout: function(d, i) {
        console.log("onmouseout", d, i);
      }
    },
    tooltip: {
      position: function(data, width, height, element) {
        return {
          top: 0,
          left: 20
        };
      }
    },
    color: {
      pattern: ['#ff7f0e', '#fec44f']
    },
    legend: {
      show: false
    },
    donut: {
      title: lastModelAcc,
      width: 85,
    },
    bindto: "#donut-chart2"
  });
  $(".c3-chart-arcs-title").attr("dy", 5);
  $("#donut-chart2 > svg > g:nth-child(2) > g.c3-chart > g.c3-chart-arcs > text").attr("data-toggle", "tooltipDonut2");
  $("#donut-chart2 > svg > g:nth-child(2) > g.c3-chart > g.c3-chart-arcs > text").attr("title", "% Forecast Accuracy");
  $(document).ready(function(){
    $('[data-toggle="tooltipDonut2"]').tooltip();
  });
  var splineChart = c3.generate({
    size: {
      height: 350,
    },
    data: {
      x: "Date",
      columns: [
        expCyanDate,
        logCICells,
        bloom_p,
        // nctCurrentDate,
      ],
      axes: {
        Probability_of_bloom: 'y',
        Log_CI_Cells_mL: 'y2'
      },
      names: {
        Probability_of_bloom: 'Probability of bloom',
        Log_CI_Cells_mL: 'Historical expectation'
      },
      type: 'spline',
      types: {
        Current: 'bar',
      },
      colors: {
        Log_CI_Cells_mL: '#de2d26',
      },
      // Onclick function for CyAN line chart
      onclick: function(d, i) {
        console.log("onclick", d, i);
        if (d.id == 'Probability_of_bloom') {
          cyanoProb = 100 * parseFloat(d.value);
          cyanoProb_1 = 100 - cyanoProb;
          nctHistoricalDate = ["Historical"];
          for (let i = 0; i < d.index + 1; i++) {
            if (i == d.index) {
              nctHistoricalDate.push(parseFloat(1))
            } else if (i !== d.index) {
              nctHistoricalDate.push('null')
            }
          }
          // $("#donut-chart > svg > g:nth-child(2) > g.c3-chart > g.c3-chart-arcs > text").text(100 * model_accuracy[d.index] + "% Observed Bloom area");
          $("#donut-chart > svg > g:nth-child(2) > g.c3-chart > g.c3-chart-arcs > text").text(100 * model_accuracy[d.index]);
          var USTdDonut = new Date(d.x);
          previousNowCastDate = d.x;
          var monthDonut = USTdDonut.getMonth();
          var dayDonut = USTdDonut.getDate();
          var yearDonut = USTdDonut.getFullYear();
          var dateSelectDonut = monthDonut + 1 + "/" + dayDonut;
          var lastweekDonut = new Date(USTdDonut.getFullYear(), USTdDonut.getMonth(), USTdDonut.getDate() + 7);
          lastweekDonutReformatted = lastweekDonut.getMonth() + 1 + "/" + lastweekDonut.getDate();
          $("#dateCyan").text(dateSelectDonut + "-" + lastweekDonutReformatted);
          $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(1) > line").css('stroke', '#17e8ce');
          $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(2) > line").css('stroke', '#ff7f0e');
          $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(1) > text").attr("dy", "-5");
          $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(2) > text").attr("dy", "10");
          donutChart.load({
            unload: true,
            columns: [
              ['Probability of a bloom', cyanoProb],
              ['Probability of no bloom', cyanoProb_1],
            ],
          });
          splineChart.xgrids([
            {
              value: previousNowCastDate,
              id: 'previousGrid',
              text: 'Previous'
            },
            {
              value: currentNowCastDate,
              class: 'currentGrid',
              text: 'Current'
            }
          ]);
          // splineChart.load({
          //   unload: nctHistoricalDate,
          //   columns: [
          //     nctHistoricalDate,
          //   ],
          //   type: 'spline',
          //   types: {
          //     Historical: 'bar',
          //   },
          //   colors: {
          //     Historical: '#17e8ce',
          //   },
          // });
        };
      },
    },
    grid: {
      x: {
        lines: [
          {
              value: currentNowCastDate,
              id: 'previousGrid',
              text: 'Previous'
            },
            {
              value: currentNowCastDate,
              class: 'currentGrid',
              text: 'Current',
              // position: 'start'
            },
        ]
      }
    },
    // color: {
    //   pattern: [chartColor]
    // },
    padding: {
      top: padTop,
      right: 80,
      left: 80,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d ",
          centered: true,
          fit: true,
          count: 20,
        }
      },
      y: {
        label: {
          text: 'Previous forecast for the year',
          position: 'outer-middle'
        },
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".0%"),
          count: 5,
          values: [.25, .50, .75, 1]
        },
        max: 1,
        min: 0,
      },
      y2: {
        show: true,
        label: {
          text: 'Historical expectation',
          position: 'outer-middle'
        },
        padding: {
          bottom: 0
        },
        type: 'linear',
        tick: {
          format: d3.format(".0%"),
          count: 5,
          // values: [.25, .50, .75, 1]
        },
        // max: .75,
        // min: 0,
      },
    },
    point: {
      r: 0,
      focus: {
        expand: {
          r: 15
        }
      }
    },
    zoom: {
      enabled: {
        type: "drag"
      },
    },
    tooltip: {
      linked: true,
      // hide: [current, nctHistoricalDate],
    },
    // subchart: {
    //   show: true,
    //   size: {
    //     height: 15
    //   },
    // },
    legend: {
      // show: true,
      // hide: [bloom_p, logCICells],
      hide: true,
    },
    line: {
      connectNull: true
    },
    bindto: "#spline-chart"
  });
  // Apply orange to the current date x-axis grid line
  $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(1) > line").css('stroke', '#17e8ce');
  $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(2) > line").css('stroke', '#17e8ce');
  // Change location of grid labels
  $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(1) > text").attr("dy", "-5");
  $("#spline-chart > svg > g:nth-child(2) > g.c3-grid.c3-grid-lines > g.c3-xgrid-lines > g:nth-child(2) > text").attr("dy", "10");

// Pie Charts inside donuts
  // var pieTestchart = c3.generate({
  //   size: {
  //     height: 200,
  //   },
  //   data: {
  //     columns: [
  //       ['Obsereved Bloom Area', 75],
  //       ['', 25],
  //     ],
  //     type: 'pie',
  //     onclick: function(d, i) {
  //       console.log("onclick", d, i);
  //     },
  //     onmouseover: function(d, i) {
  //       console.log("onmouseover", d, i);
  //     },
  //     onmouseout: function(d, i) {
  //       console.log("onmouseout", d, i);
  //     }
  //   },
  //   color: {
  //     pattern: ['#7fcdbb', '#ffffcc']
  //   },
  //   legend: {
  //     hide: true,
  //   },
  //   bindto: "#pieTestChart"
  // });
  //
  // var pieTestchart2 = c3.generate({
  //   size: {
  //     height: 200,
  //   },
  //   data: {
  //     columns: [
  //       ['Forecast Accuracy', 75],
  //       ['', 25],
  //     ],
  //     type: 'pie',
  //     onclick: function(d, i) {
  //       console.log("onclick", d, i);
  //     },
  //     onmouseover: function(d, i) {
  //       console.log("onmouseover", d, i);
  //     },
  //     onmouseout: function(d, i) {
  //       console.log("onmouseout", d, i);
  //     }
  //   },
  //   color: {
  //     pattern: ['#fe9929', '#ffffcc']
  //   },
  //   legend: {
  //     hide: true,
  //   },
  //   bindto: "#pieTestChart2"
  // });
  // Tab Interactions
  $("#weather-tab").on("click", function() {
    // Remove Map Layers
    mymap.removeLayer(sites);
    mymap.removeLayer(sampleSites);
    mymap.removeLayer(weatherSites);
    // Add selected geo layer for selected year
    mymap.addLayer(weatherSites);
    mymap.fitBounds(lakeBoundsClosedMini);
  });
  $("#stream-tab").on("click", function() {
    // Remove Map Layers
    mymap.removeLayer(sites);
    mymap.removeLayer(sampleSites);
    mymap.removeLayer(weatherSites);
    // Add selected geo layer for selected year
    mymap.addLayer(sites);
    mymap.fitBounds(lakeBoundsClosedMini)
  });
  $("#sample-tab").on("click", function() {
    // Remove Map Layers
    mymap.removeLayer(sites);
    mymap.removeLayer(sampleSites);
    mymap.removeLayer(weatherSites);
    // Add selected geo layer for selected year
    mymap.addLayer(sampleSites);
    mymap.fitBounds(lakeBoundsClosedMini)
  });
  $("#cyan-tab").on("click", function() {
    // Remove Map Layers
    mymap.removeLayer(sites);
    mymap.removeLayer(sampleSites);
    mymap.removeLayer(weatherSites);
    // Add selected geo layer for selected year
    mymap.removeLayer(sampleSites);
    mymap.fitBounds(lakeBoundsClosedMini);
    donutChart.load({
      unload: true,
      columns: [
        [cyan, cyanLast],
        [nocyan, noCyanLast],
      ],
    });
    donutChart2.load({
      unload: true,
      columns: [
        [cyan, cyanLast],
        [nocyan, noCyanLast],
      ],
    });
    // pieTestchart.load({
    //   unload: true,
    //   columns: [
    //     ['Obsereved Bloom Area', lastModelAcc],
    //     ['', lastModelAccOther],
    //   ],
    // });
    // pieTestchart2.load({
    //   unload: true,
    //   columns: [
    //     ['Forecast Accuracy', lastModelAcc],
    //     ['', lastModelAccOther],
    //   ],
    // });
    splineChart.load({
      unload: true,
      columns: [
        expCyanDate,
        bloom_p,
        // nctCurrentDate,
        logCICells,
      ],
    });

  });

  // Stream Gage Year Selection
  $("#clearGage").on("click", function() {
    chart.load({
      unload: true,
    });
    chart2.load({
      unload: true,
    });
    h20SumChart.load({
      unload: true,
    });
    dchMeanChart.load({
      unload: true,
    });
    dchSumChart.load({
      unload: true,
    });
    $(".gageCheck").css('color', 'white');
  });
  $("#gage2022").on("click", function() {
    color2022 = $("#gage2022").css('color');
    if (color2022 == 'rgb(255, 255, 255)') {
      streamGage1Data2022 = [];
      streamGage1Data2022wtMean = ["2022"];
      streamGage1Data2022wtSum = ["2022"];
      streamGage1Data2022dchMean = ["2022"];
      streamGage1Data2022dchSum = ["2022"];

      var siteSelect = {
        name: gageID,
        wtM2022: streamGage1Data2022wtMean,
        wtS2022: streamGage1Data2022wtSum,
        dchM2022: streamGage1Data2022dchMean,
        dchS2022: streamGage1Data2022dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2022],
      });
      chart2.load({
        columns: [siteSelect.wtM2022],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2022],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2022],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2022],
      });
      var stroke = chart.color('2022');
      $("#gage2022").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2022"],
      });
      chart2.unload({
        ids: ["2022"],
      });
      h20SumChart.unload({
        ids: ["2022"],
      });
      dchMeanChart.unload({
        ids: ["2022"],
      });
      dchSumChart.unload({
        ids: ["2022"],
      });
      $("#gage2022").css('color', 'white');
    }
  });
  $("#gage2021").on("click", function() {
    color2021 = $("#gage2021").css('color');
    if (color2021 == 'rgb(255, 255, 255)') {
      streamGage1Data2021 = [];
      streamGage1Data2021wtMean = ["2021"];
      streamGage1Data2021wtSum = ["2021"];
      streamGage1Data2021dchMean = ["2021"];
      streamGage1Data2021dchSum = ["2021"];

      var siteSelect = {
        name: gageID,
        wtM2021: streamGage1Data2021wtMean,
        wtS2021: streamGage1Data2021wtSum,
        dchM2021: streamGage1Data2021dchMean,
        dchS2021: streamGage1Data2021dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2021],
      });
      chart2.load({
        columns: [siteSelect.wtM2021],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2021],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2021],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2021],
      });
      var stroke = chart.color('2021');
      $("#gage2021").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2021"],
      });
      chart2.unload({
        ids: ["2021"],
      });
      h20SumChart.unload({
        ids: ["2021"],
      });
      dchMeanChart.unload({
        ids: ["2021"],
      });
      dchSumChart.unload({
        ids: ["2021"],
      });
      $("#gage2021").css('color', 'white');
    }
  });
  $("#gage2020").on("click", function() {
    color2020 = $("#gage2020").css('color');
    if (color2020 == 'rgb(255, 255, 255)') {
      streamGage1Data2020 = [];
      streamGage1Data2020wtMean = ["2020"];
      streamGage1Data2020wtSum = ["2020"];
      streamGage1Data2020dchMean = ["2020"];
      streamGage1Data2020dchSum = ["2020"];

      var siteSelect = {
        name: gageID,
        wtM2020: streamGage1Data2020wtMean,
        wtS2020: streamGage1Data2020wtSum,
        dchM2020: streamGage1Data2020dchMean,
        dchS2020: streamGage1Data2020dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2020],
      });
      chart2.load({
        columns: [siteSelect.wtM2020],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2020],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2020],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2020],
      });
      var stroke = chart.color('2020');
      $("#gage2020").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2020"],
      });
      chart2.unload({
        ids: ["2020"],
      });
      h20SumChart.unload({
        ids: ["2020"],
      });
      dchMeanChart.unload({
        ids: ["2020"],
      });
      dchSumChart.unload({
        ids: ["2020"],
      });
      $("#gage2020").css('color', 'white');
    }
  });
  $("#gage2019").on("click", function() {
    color2019 = $("#gage2019").css('color');
    if (color2019 == 'rgb(255, 255, 255)') {
      streamGage1Data2019 = [];
      streamGage1Data2019wtMean = ["2019"];
      streamGage1Data2019wtSum = ["2019"];
      streamGage1Data2019dchMean = ["2019"];
      streamGage1Data2019dchSum = ["2019"];

      var siteSelect = {
        name: gageID,
        wtM2019: streamGage1Data2019wtMean,
        wtS2019: streamGage1Data2019wtSum,
        dchM2019: streamGage1Data2019dchMean,
        dchS2019: streamGage1Data2019dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2019],
      });
      chart2.load({
        columns: [siteSelect.wtM2019],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2019],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2019],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2019],
      });
      var stroke = chart.color('2019');
      $("#gage2019").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2019"],
      });
      chart2.unload({
        ids: ["2019"],
      });
      h20SumChart.unload({
        ids: ["2019"],
      });
      dchMeanChart.unload({
        ids: ["2019"],
      });
      dchSumChart.unload({
        ids: ["2019"],
      });
      $("#gage2019").css('color', 'white');
    }
  });
  $("#gage2018").on("click", function() {
    color2018 = $("#gage2018").css('color');
    if (color2018 == 'rgb(255, 255, 255)') {
      streamGage1Data2018 = [];
      streamGage1Data2018wtMean = ["2018"];
      streamGage1Data2018wtSum = ["2018"];
      streamGage1Data2018dchMean = ["2018"];
      streamGage1Data2018dchSum = ["2018"];

      var siteSelect = {
        name: gageID,
        wtM2018: streamGage1Data2018wtMean,
        wtS2018: streamGage1Data2018wtSum,
        dchM2018: streamGage1Data2018dchMean,
        dchS2018: streamGage1Data2018dchSum,
      }

      siteCounts(siteSelect);


      chart.load({
        columns: [siteSelect.wtM2018],
      });
      chart2.load({
        columns: [siteSelect.wtM2018],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2018],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2018],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2018],
      });
      var stroke = chart.color('2018');
      $("#gage2018").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2018"],
      });
      chart2.unload({
        ids: ["2018"],
      });
      h20SumChart.unload({
        ids: ["2018"],
      });
      dchMeanChart.unload({
        ids: ["2018"],
      });
      dchSumChart.unload({
        ids: ["2018"],
      });
      $("#gage2018").css('color', 'white');
    }
  });
  $("#gage2017").on("click", function() {
    color2017 = $("#gage2017").css('color');
    if (color2017 == 'rgb(255, 255, 255)') {
      streamGage1Data2017 = [];
      streamGage1Data2017wtMean = ["2017"];
      streamGage1Data2017wtSum = ["2017"];
      streamGage1Data2017dchMean = ["2017"];
      streamGage1Data2017dchSum = ["2017"];

      var siteSelect = {
        name: gageID,
        wtM2017: streamGage1Data2017wtMean,
        wtS2017: streamGage1Data2017wtSum,
        dchM2017: streamGage1Data2017dchMean,
        dchS2017: streamGage1Data2017dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2017],
      });
      chart2.load({
        columns: [siteSelect.wtM2017],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2017],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2017],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2017],
      });
      var stroke = chart.color('2017');
      $("#gage2017").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2017"],
      });
      chart2.unload({
        ids: ["2017"],
      });
      h20SumChart.unload({
        ids: ["2017"],
      });
      dchMeanChart.unload({
        ids: ["2017"],
      });
      dchSumChart.unload({
        ids: ["2017"],
      });
      $("#gage2017").css('color', 'white');
    }
  });
  $("#gage2016").on("click", function() {
    color2016 = $("#gage2016").css('color');
    if (color2016 == 'rgb(255, 255, 255)') {
      streamGage1Data2016 = [];
      streamGage1Data2016wtMean = ["2016"];
      streamGage1Data2016wtSum = ["2016"];
      streamGage1Data2016dchMean = ["2016"];
      streamGage1Data2016dchSum = ["2016"];

      var siteSelect = {
        name: gageID,
        wtM2016: streamGage1Data2016wtMean,
        wtS2016: streamGage1Data2016wtSum,
        dchM2016: streamGage1Data2016dchMean,
        dchS2016: streamGage1Data2016dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2016],
      });
      chart2.load({
        columns: [siteSelect.wtM2016],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2016],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2016],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2016],
      });
      var stroke = chart.color('2016');
      $("#gage2016").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2016"],
      });
      chart2.unload({
        ids: ["2016"],
      });
      h20SumChart.unload({
        ids: ["2016"],
      });
      dchMeanChart.unload({
        ids: ["2016"],
      });
      dchSumChart.unload({
        ids: ["2016"],
      });
      $("#gage2016").css('color', 'white');
    }
  });
  $("#gage2015").on("click", function() {
    color2015 = $("#gage2015").css('color');
    if (color2015 == 'rgb(255, 255, 255)') {
      streamGage1Data2015 = [];
      streamGage1Data2015wtMean = ["2015"];
      streamGage1Data2015wtSum = ["2015"];
      streamGage1Data2015dchMean = ["2015"];
      streamGage1Data2015dchSum = ["2015"];

      var siteSelect = {
        name: gageID,
        wtM2015: streamGage1Data2015wtMean,
        wtS2015: streamGage1Data2015wtSum,
        dchM2015: streamGage1Data2015dchMean,
        dchS2015: streamGage1Data2015dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2015],
      });
      chart2.load({
        columns: [siteSelect.wtM2015],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2015],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2015],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2015],
      });
      var stroke = chart.color('2015');
      $("#gage2015").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2015"],
      });
      chart2.unload({
        ids: ["2015"],
      });
      h20SumChart.unload({
        ids: ["2015"],
      });
      dchMeanChart.unload({
        ids: ["2015"],
      });
      dchSumChart.unload({
        ids: ["2015"],
      });
      $("#gage2015").css('color', 'white');
    }
  });
  $("#gage2014").on("click", function() {
    color2014 = $("#gage2014").css('color');
    if (color2014 == 'rgb(255, 255, 255)') {
      streamGage1Data2014 = [];
      streamGage1Data2014wtMean = ["2014"];
      streamGage1Data2014wtSum = ["2014"];
      streamGage1Data2014dchMean = ["2014"];
      streamGage1Data2014dchSum = ["2014"];

      var siteSelect = {
        name: gageID,
        wtM2014: streamGage1Data2014wtMean,
        wtS2014: streamGage1Data2014wtSum,
        dchM2014: streamGage1Data2014dchMean,
        dchS2014: streamGage1Data2014dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2014],
      });
      chart2.load({
        columns: [siteSelect.wtM2014],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2014],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2014],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2014],
      });
      var stroke = chart.color('2014');
      $("#gage2014").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2014"],
      });
      chart2.unload({
        ids: ["2014"],
      });
      h20SumChart.unload({
        ids: ["2014"],
      });
      dchMeanChart.unload({
        ids: ["2014"],
      });
      dchSumChart.unload({
        ids: ["2014"],
      });
      $("#gage2014").css('color', 'white');
    }
  });
  $("#gage2013").on("click", function() {
    color2013 = $("#gage2013").css('color');
    if (color2013 == 'rgb(255, 255, 255)') {
      streamGage1Data2013 = [];
      streamGage1Data2013wtMean = ["2013"];
      streamGage1Data2013wtSum = ["2013"];
      streamGage1Data2013dchMean = ["2013"];
      streamGage1Data2013dchSum = ["2013"];

      var siteSelect = {
        name: gageID,
        wtM2013: streamGage1Data2013wtMean,
        wtS2013: streamGage1Data2013wtSum,
        dchM2013: streamGage1Data2013dchMean,
        dchS2013: streamGage1Data2013dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2013],
      });
      chart2.load({
        columns: [siteSelect.wtM2013],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2013],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2013],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2013],
      });
      var stroke = chart.color('2013');
      $("#gage2013").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2013"],
      });
      chart2.unload({
        ids: ["2013"],
      });
      h20SumChart.unload({
        ids: ["2013"],
      });
      dchMeanChart.unload({
        ids: ["2013"],
      });
      dchSumChart.unload({
        ids: ["2013"],
      });
      $("#gage2013").css('color', 'white');
    }
  });
  $("#gage2012").on("click", function() {
    color2012 = $("#gage2012").css('color');
    if (color2012 == 'rgb(255, 255, 255)') {
      streamGage1Data2012 = [];
      streamGage1Data2012wtMean = ["2012"];
      streamGage1Data2012wtSum = ["2012"];
      streamGage1Data2012dchMean = ["2012"];
      streamGage1Data2012dchSum = ["2012"];

      var siteSelect = {
        name: gageID,
        wtM2012: streamGage1Data2012wtMean,
        wtS2012: streamGage1Data2012wtSum,
        dchM2012: streamGage1Data2012dchMean,
        dchS2012: streamGage1Data2012dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2012],
      });
      chart2.load({
        columns: [siteSelect.wtM2012],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2012],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2012],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2012],
      });
      var stroke = chart.color('2012');
      $("#gage2012").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2012"],
      });
      chart2.unload({
        ids: ["2012"],
      });
      h20SumChart.unload({
        ids: ["2012"],
      });
      dchMeanChart.unload({
        ids: ["2012"],
      });
      dchSumChart.unload({
        ids: ["2012"],
      });
      $("#gage2012").css('color', 'white');
    }
  });
  $("#gage2011").on("click", function() {
    color2011 = $("#gage2011").css('color');
    if (color2011 == 'rgb(255, 255, 255)') {
      streamGage1Data2011 = [];
      streamGage1Data2011wtMean = ["2011"];
      streamGage1Data2011wtSum = ["2011"];
      streamGage1Data2011dchMean = ["2011"];
      streamGage1Data2011dchSum = ["2011"];

      var siteSelect = {
        name: gageID,
        wtM2011: streamGage1Data2011wtMean,
        wtS2011: streamGage1Data2011wtSum,
        dchM2011: streamGage1Data2011dchMean,
        dchS2011: streamGage1Data2011dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2011],
      });
      chart2.load({
        columns: [siteSelect.wtM2011],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2011],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2011],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2011],
      });
      var stroke = chart.color('2011');
      $("#gage2011").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2011"],
      });
      chart2.unload({
        ids: ["2011"],
      });
      h20SumChart.unload({
        ids: ["2011"],
      });
      dchMeanChart.unload({
        ids: ["2011"],
      });
      dchSumChart.unload({
        ids: ["2011"],
      });
      $("#gage2011").css('color', 'white');
    }
  });
  $("#gage2010").on("click", function() {
    color2010 = $("#gage2010").css('color');
    if (color2010 == 'rgb(255, 255, 255)') {
      streamGage1Data2010 = [];
      streamGage1Data2010wtMean = ["2010"];
      streamGage1Data2010wtSum = ["2010"];
      streamGage1Data2010dchMean = ["2010"];
      streamGage1Data2010dchSum = ["2010"];

      var siteSelect = {
        name: gageID,
        wtM2010: streamGage1Data2010wtMean,
        wtS2010: streamGage1Data2010wtSum,
        dchM2010: streamGage1Data2010dchMean,
        dchS2010: streamGage1Data2010dchSum,
      }

      siteCounts(siteSelect);

      chart.load({
        columns: [siteSelect.wtM2010],
      });
      chart2.load({
        columns: [siteSelect.wtM2010],
      });
      h20SumChart.load({
        columns: [siteSelect.wtS2010],
      });
      dchMeanChart.load({
        columns: [siteSelect.dchM2010],
      });
      dchSumChart.load({
        columns: [siteSelect.dchS2010],
      });
      var stroke = chart.color('2010');
      $("#gage2010").css('color', stroke);
    } else {
      chart.unload({
        ids: ["2010"],
      });
      chart2.unload({
        ids: ["2010"],
      });
      h20SumChart.unload({
        ids: ["2010"],
      });
      dchMeanChart.unload({
        ids: ["2010"],
      });
      dchSumChart.unload({
        ids: ["2010"],
      });
      $("#gage2010").css('color', 'white');
    }
  });

  // Weather Year Selection
  $("#clearWeather").on("click", function() {
    precipSubChart.load({
      unload: true,
    });
    precipChart.load({
      unload: true,
    });
    aitTempChart.load({
      unload: true,
    });
    surfChart.load({
      unload: true,
    });
    windChart.load({
      unload: true,
    });
    precipSumSubChart.load({
      unload: true,
    });
    precipSumChart.load({
      unload: true,
    });
    aitTempSumChart.load({
      unload: true,
    });
    surfSumChart.load({
      unload: true,
    });
    windSumChart.load({
      unload: true,
    });
    $(".weatherCheck").css('color', 'white');
  });
  $("#weather2022").on("click", function() {
    color2022 = $("#weather2022").css('color');
    if (color2022 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2022 = [];
      weatherData2022pcMean = ["2022"];
      weatherData2022pcSum = ["2022"];
      weatherData2022atempMean = ["2022"];
      weatherData2022atempSum = ["2022"];
      weatherData2022surfMean = ["2022"];
      weatherData2022surfSum = ["2022"];
      weatherData2022windMean = ["2022"];
      weatherData2022windSum = ["2022"];

      var weatherVars = {
        name: "Precip",
        pcM2022: weatherData2022pcMean,
        pcS2022: weatherData2022pcSum,
        atempM2022: weatherData2022atempMean,
        atempS2022: weatherData2022atempSum,
        surfM2022: weatherData2022surfMean,
        surfS2022: weatherData2022surfSum,
        windM2022: weatherData2022windMean,
        windS2022: weatherData2022windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2022],
      });
      precipChart.load({
        columns: [weatherVars.pcM2022],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2022],
      });
      surfChart.load({
        columns: [weatherVars.surfM2022],
      });
      windChart.load({
        columns: [weatherVars.windM2022],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2022],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2022],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2022],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2022],
      });
      windSumChart.load({
        columns: [weatherVars.windS2022],
      });

      var stroke = precipSubChart.color('2022');
      $("#weather2022").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2022"],
      });
      precipChart.unload({
        ids: ["2022"],
      });
      aitTempChart.unload({
        ids: ["2022"],
      });
      surfChart.unload({
        ids: ["2022"],
      });
      windChart.unload({
        ids: ["2022"],
      });
      precipSumSubChart.unload({
        ids: ["2022"],
      });
      precipSumChart.unload({
        ids: ["2022"],
      });
      aitTempSumChart.unload({
        ids: ["2022"],
      });
      surfSumChart.unload({
        ids: ["2022"],
      });
      windSumChart.unload({
        ids: ["2022"],
      });
      $("#weather2022").css('color', 'white');
    }
  });
  $("#weather2021").on("click", function() {
    color2021 = $("#weather2021").css('color');
    if (color2021 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2021 = [];
      weatherData2021pcMean = ["2021"];
      weatherData2021pcSum = ["2021"];
      weatherData2021atempMean = ["2021"];
      weatherData2021atempSum = ["2021"];
      weatherData2021surfMean = ["2021"];
      weatherData2021surfSum = ["2021"];
      weatherData2021windMean = ["2021"];
      weatherData2021windSum = ["2021"];

      var weatherVars = {
        name: "Precip",
        pcM2021: weatherData2021pcMean,
        pcS2021: weatherData2021pcSum,
        atempM2021: weatherData2021atempMean,
        atempS2021: weatherData2021atempSum,
        surfM2021: weatherData2021surfMean,
        surfS2021: weatherData2021surfSum,
        windM2021: weatherData2021windMean,
        windS2021: weatherData2021windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2021],
      });
      precipChart.load({
        columns: [weatherVars.pcM2021],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2021],
      });
      surfChart.load({
        columns: [weatherVars.surfM2021],
      });
      windChart.load({
        columns: [weatherVars.windM2021],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2021],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2021],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2021],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2021],
      });
      windSumChart.load({
        columns: [weatherVars.windS2021],
      });

      var stroke = precipSubChart.color('2021');
      $("#weather2021").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2021"],
      });
      precipChart.unload({
        ids: ["2021"],
      });
      aitTempChart.unload({
        ids: ["2021"],
      });
      surfChart.unload({
        ids: ["2021"],
      });
      windChart.unload({
        ids: ["2021"],
      });
      precipSumSubChart.unload({
        ids: ["2021"],
      });
      precipSumChart.unload({
        ids: ["2021"],
      });
      aitTempSumChart.unload({
        ids: ["2021"],
      });
      surfSumChart.unload({
        ids: ["2021"],
      });
      windSumChart.unload({
        ids: ["2021"],
      });
      $("#weather2021").css('color', 'white');

    }

  });
  $("#weather2020").on("click", function() {
    color2020 = $("#weather2020").css('color');
    if (color2020 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2020 = [];
      weatherData2020pcMean = ["2020"];
      weatherData2020pcSum = ["2020"];
      weatherData2020atempMean = ["2020"];
      weatherData2020atempSum = ["2020"];
      weatherData2020surfMean = ["2020"];
      weatherData2020surfSum = ["2020"];
      weatherData2020windMean = ["2020"];
      weatherData2020windSum = ["2020"];

      var weatherVars = {
        name: "Precip",
        pcM2020: weatherData2020pcMean,
        pcS2020: weatherData2020pcSum,
        atempM2020: weatherData2020atempMean,
        atempS2020: weatherData2020atempSum,
        surfM2020: weatherData2020surfMean,
        surfS2020: weatherData2020surfSum,
        windM2020: weatherData2020windMean,
        windS2020: weatherData2020windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2020],
      });
      precipChart.load({
        columns: [weatherVars.pcM2020],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2020],
      });
      surfChart.load({
        columns: [weatherVars.surfM2020],
      });
      windChart.load({
        columns: [weatherVars.windM2020],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2020],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2020],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2020],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2020],
      });
      windSumChart.load({
        columns: [weatherVars.windS2020],
      });

      var stroke = precipSubChart.color('2020');
      $("#weather2020").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2020"],
      });
      precipChart.unload({
        ids: ["2020"],
      });
      aitTempChart.unload({
        ids: ["2020"],
      });
      surfChart.unload({
        ids: ["2020"],
      });
      windChart.unload({
        ids: ["2020"],
      });
      precipSumSubChart.unload({
        ids: ["2020"],
      });
      precipSumChart.unload({
        ids: ["2020"],
      });
      aitTempSumChart.unload({
        ids: ["2020"],
      });
      surfSumChart.unload({
        ids: ["2020"],
      });
      windSumChart.unload({
        ids: ["2020"],
      });
      $("#weather2020").css('color', 'white');
    }
  });
  $("#weather2019").on("click", function() {
    color2019 = $("#weather2019").css('color');
    if (color2019 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2019 = [];
      weatherData2019pcMean = ["2019"];
      weatherData2019pcSum = ["2019"];
      weatherData2019atempMean = ["2019"];
      weatherData2019atempSum = ["2019"];
      weatherData2019surfMean = ["2019"];
      weatherData2019surfSum = ["2019"];
      weatherData2019windMean = ["2019"];
      weatherData2019windSum = ["2019"];

      var weatherVars = {
        name: "Precip",
        pcM2019: weatherData2019pcMean,
        pcS2019: weatherData2019pcSum,
        atempM2019: weatherData2019atempMean,
        atempS2019: weatherData2019atempSum,
        surfM2019: weatherData2019surfMean,
        surfS2019: weatherData2019surfSum,
        windM2019: weatherData2019windMean,
        windS2019: weatherData2019windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2019],
      });
      precipChart.load({
        columns: [weatherVars.pcM2019],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2019],
      });
      surfChart.load({
        columns: [weatherVars.surfM2019],
      });
      windChart.load({
        columns: [weatherVars.windM2019],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2019],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2019],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2019],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2019],
      });
      windSumChart.load({
        columns: [weatherVars.windS2019],
      });

      var stroke = precipSubChart.color('2019');
      $("#weather2019").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2019"],
      });
      precipChart.unload({
        ids: ["2019"],
      });
      aitTempChart.unload({
        ids: ["2019"],
      });
      surfChart.unload({
        ids: ["2019"],
      });
      windChart.unload({
        ids: ["2019"],
      });
      precipSumSubChart.unload({
        ids: ["2019"],
      });
      precipSumChart.unload({
        ids: ["2019"],
      });
      aitTempSumChart.unload({
        ids: ["2019"],
      });
      surfSumChart.unload({
        ids: ["2019"],
      });
      windSumChart.unload({
        ids: ["2019"],
      });
      $("#weather2019").css('color', 'white');
    }
  });
  $("#weather2018").on("click", function() {
    color2018 = $("#weather2018").css('color');
    if (color2018 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2018 = [];
      weatherData2018pcMean = ["2018"];
      weatherData2018pcSum = ["2018"];
      weatherData2018atempMean = ["2018"];
      weatherData2018atempSum = ["2018"];
      weatherData2018surfMean = ["2018"];
      weatherData2018surfSum = ["2018"];
      weatherData2018windMean = ["2018"];
      weatherData2018windSum = ["2018"];

      var weatherVars = {
        name: "Precip",
        pcM2018: weatherData2018pcMean,
        pcS2018: weatherData2018pcSum,
        atempM2018: weatherData2018atempMean,
        atempS2018: weatherData2018atempSum,
        surfM2018: weatherData2018surfMean,
        surfS2018: weatherData2018surfSum,
        windM2018: weatherData2018windMean,
        windS2018: weatherData2018windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2018],
      });
      precipChart.load({
        columns: [weatherVars.pcM2018],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2018],
      });
      surfChart.load({
        columns: [weatherVars.surfM2018],
      });
      windChart.load({
        columns: [weatherVars.windM2018],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2018],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2018],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2018],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2018],
      });
      windSumChart.load({
        columns: [weatherVars.windS2018],
      });

      var stroke = precipSubChart.color('2018');
      $("#weather2018").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2018"],
      });
      precipChart.unload({
        ids: ["2018"],
      });
      aitTempChart.unload({
        ids: ["2018"],
      });
      surfChart.unload({
        ids: ["2018"],
      });
      windChart.unload({
        ids: ["2018"],
      });
      precipSumSubChart.unload({
        ids: ["2018"],
      });
      precipSumChart.unload({
        ids: ["2018"],
      });
      aitTempSumChart.unload({
        ids: ["2018"],
      });
      surfSumChart.unload({
        ids: ["2018"],
      });
      windSumChart.unload({
        ids: ["2018"],
      });
      $("#weather2018").css('color', 'white');
    }
  });
  $("#weather2017").on("click", function() {
    color2017 = $("#weather2017").css('color');
    if (color2017 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2017 = [];
      weatherData2017pcMean = ["2017"];
      weatherData2017pcSum = ["2017"];
      weatherData2017atempMean = ["2017"];
      weatherData2017atempSum = ["2017"];
      weatherData2017surfMean = ["2017"];
      weatherData2017surfSum = ["2017"];
      weatherData2017windMean = ["2017"];
      weatherData2017windSum = ["2017"];

      var weatherVars = {
        name: "Precip",
        pcM2017: weatherData2017pcMean,
        pcS2017: weatherData2017pcSum,
        atempM2017: weatherData2017atempMean,
        atempS2017: weatherData2017atempSum,
        surfM2017: weatherData2017surfMean,
        surfS2017: weatherData2017surfSum,
        windM2017: weatherData2017windMean,
        windS2017: weatherData2017windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2017],
      });
      precipChart.load({
        columns: [weatherVars.pcM2017],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2017],
      });
      surfChart.load({
        columns: [weatherVars.surfM2017],
      });
      windChart.load({
        columns: [weatherVars.windM2017],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2017],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2017],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2017],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2017],
      });
      windSumChart.load({
        columns: [weatherVars.windS2017],
      });

      var stroke = precipSubChart.color('2017');
      $("#weather2017").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2017"],
      });
      precipChart.unload({
        ids: ["2017"],
      });
      aitTempChart.unload({
        ids: ["2017"],
      });
      surfChart.unload({
        ids: ["2017"],
      });
      windChart.unload({
        ids: ["2017"],
      });
      precipSumSubChart.unload({
        ids: ["2017"],
      });
      precipSumChart.unload({
        ids: ["2017"],
      });
      aitTempSumChart.unload({
        ids: ["2017"],
      });
      surfSumChart.unload({
        ids: ["2017"],
      });
      windSumChart.unload({
        ids: ["2017"],
      });
      $("#weather2017").css('color', 'white');
    }
  });
  $("#weather2016").on("click", function() {
    color2016 = $("#weather2016").css('color');
    if (color2016 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2016 = [];
      weatherData2016pcMean = ["2016"];
      weatherData2016pcSum = ["2016"];
      weatherData2016atempMean = ["2016"];
      weatherData2016atempSum = ["2016"];
      weatherData2016surfMean = ["2016"];
      weatherData2016surfSum = ["2016"];
      weatherData2016windMean = ["2016"];
      weatherData2016windSum = ["2016"];

      var weatherVars = {
        name: "Precip",
        pcM2016: weatherData2016pcMean,
        pcS2016: weatherData2016pcSum,
        atempM2016: weatherData2016atempMean,
        atempS2016: weatherData2016atempSum,
        surfM2016: weatherData2016surfMean,
        surfS2016: weatherData2016surfSum,
        windM2016: weatherData2016windMean,
        windS2016: weatherData2016windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2016],
      });
      precipChart.load({
        columns: [weatherVars.pcM2016],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2016],
      });
      surfChart.load({
        columns: [weatherVars.surfM2016],
      });
      windChart.load({
        columns: [weatherVars.windM2016],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2016],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2016],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2016],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2016],
      });
      windSumChart.load({
        columns: [weatherVars.windS2016],
      });

      var stroke = precipSubChart.color('2016');
      $("#weather2016").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2016"],
      });
      precipChart.unload({
        ids: ["2016"],
      });
      aitTempChart.unload({
        ids: ["2016"],
      });
      surfChart.unload({
        ids: ["2016"],
      });
      windChart.unload({
        ids: ["2016"],
      });
      precipSumSubChart.unload({
        ids: ["2016"],
      });
      precipSumChart.unload({
        ids: ["2016"],
      });
      aitTempSumChart.unload({
        ids: ["2016"],
      });
      surfSumChart.unload({
        ids: ["2016"],
      });
      windSumChart.unload({
        ids: ["2016"],
      });
      $("#weather2016").css('color', 'white');
    }
  });
  $("#weather2015").on("click", function() {
    color2015 = $("#weather2015").css('color');
    if (color2015 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2015 = [];
      weatherData2015pcMean = ["2015"];
      weatherData2015pcSum = ["2015"];
      weatherData2015atempMean = ["2015"];
      weatherData2015atempSum = ["2015"];
      weatherData2015surfMean = ["2015"];
      weatherData2015surfSum = ["2015"];
      weatherData2015windMean = ["2015"];
      weatherData2015windSum = ["2015"];

      var weatherVars = {
        name: "Precip",
        pcM2015: weatherData2015pcMean,
        pcS2015: weatherData2015pcSum,
        atempM2015: weatherData2015atempMean,
        atempS2015: weatherData2015atempSum,
        surfM2015: weatherData2015surfMean,
        surfS2015: weatherData2015surfSum,
        windM2015: weatherData2015windMean,
        windS2015: weatherData2015windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2015],
      });
      precipChart.load({
        columns: [weatherVars.pcM2015],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2015],
      });
      surfChart.load({
        columns: [weatherVars.surfM2015],
      });
      windChart.load({
        columns: [weatherVars.windM2015],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2015],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2015],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2015],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2015],
      });
      windSumChart.load({
        columns: [weatherVars.windS2015],
      });

      var stroke = precipSubChart.color('2015');
      $("#weather2015").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2015"],
      });
      precipChart.unload({
        ids: ["2015"],
      });
      aitTempChart.unload({
        ids: ["2015"],
      });
      surfChart.unload({
        ids: ["2015"],
      });
      windChart.unload({
        ids: ["2015"],
      });
      precipSumSubChart.unload({
        ids: ["2015"],
      });
      precipSumChart.unload({
        ids: ["2015"],
      });
      aitTempSumChart.unload({
        ids: ["2015"],
      });
      surfSumChart.unload({
        ids: ["2015"],
      });
      windSumChart.unload({
        ids: ["2015"],
      });
      $("#weather2015").css('color', 'white');
    }
  });
  $("#weather2014").on("click", function() {
    color2014 = $("#weather2014").css('color');
    if (color2014 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2014 = [];
      weatherData2014pcMean = ["2014"];
      weatherData2014pcSum = ["2014"];
      weatherData2014atempMean = ["2014"];
      weatherData2014atempSum = ["2014"];
      weatherData2014surfMean = ["2014"];
      weatherData2014surfSum = ["2014"];
      weatherData2014windMean = ["2014"];
      weatherData2014windSum = ["2014"];

      var weatherVars = {
        name: "Precip",
        pcM2014: weatherData2014pcMean,
        pcS2014: weatherData2014pcSum,
        atempM2014: weatherData2014atempMean,
        atempS2014: weatherData2014atempSum,
        surfM2014: weatherData2014surfMean,
        surfS2014: weatherData2014surfSum,
        windM2014: weatherData2014windMean,
        windS2014: weatherData2014windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2014],
      });
      precipChart.load({
        columns: [weatherVars.pcM2014],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2014],
      });
      surfChart.load({
        columns: [weatherVars.surfM2014],
      });
      windChart.load({
        columns: [weatherVars.windM2014],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2014],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2014],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2014],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2014],
      });
      windSumChart.load({
        columns: [weatherVars.windS2014],
      });

      var stroke = precipSubChart.color('2014');
      $("#weather2014").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2014"],
      });
      precipChart.unload({
        ids: ["2014"],
      });
      aitTempChart.unload({
        ids: ["2014"],
      });
      surfChart.unload({
        ids: ["2014"],
      });
      windChart.unload({
        ids: ["2014"],
      });
      precipSumSubChart.unload({
        ids: ["2014"],
      });
      precipSumChart.unload({
        ids: ["2014"],
      });
      aitTempSumChart.unload({
        ids: ["2014"],
      });
      surfSumChart.unload({
        ids: ["2014"],
      });
      windSumChart.unload({
        ids: ["2014"],
      });
      $("#weather2014").css('color', 'white');
    }
  });
  $("#weather2013").on("click", function() {
    color2013 = $("#weather2013").css('color');
    if (color2013 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2013 = [];
      weatherData2013pcMean = ["2013"];
      weatherData2013pcSum = ["2013"];
      weatherData2013atempMean = ["2013"];
      weatherData2013atempSum = ["2013"];
      weatherData2013surfMean = ["2013"];
      weatherData2013surfSum = ["2013"];
      weatherData2013windMean = ["2013"];
      weatherData2013windSum = ["2013"];

      var weatherVars = {
        name: "Precip",
        pcM2013: weatherData2013pcMean,
        pcS2013: weatherData2013pcSum,
        atempM2013: weatherData2013atempMean,
        atempS2013: weatherData2013atempSum,
        surfM2013: weatherData2013surfMean,
        surfS2013: weatherData2013surfSum,
        windM2013: weatherData2013windMean,
        windS2013: weatherData2013windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2013],
      });
      precipChart.load({
        columns: [weatherVars.pcM2013],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2013],
      });
      surfChart.load({
        columns: [weatherVars.surfM2013],
      });
      windChart.load({
        columns: [weatherVars.windM2013],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2013],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2013],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2013],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2013],
      });
      windSumChart.load({
        columns: [weatherVars.windS2013],
      });

      var stroke = precipSubChart.color('2013');
      $("#weather2013").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2013"],
      });
      precipChart.unload({
        ids: ["2013"],
      });
      aitTempChart.unload({
        ids: ["2013"],
      });
      surfChart.unload({
        ids: ["2013"],
      });
      windChart.unload({
        ids: ["2013"],
      });
      precipSumSubChart.unload({
        ids: ["2013"],
      });
      precipSumChart.unload({
        ids: ["2013"],
      });
      aitTempSumChart.unload({
        ids: ["2013"],
      });
      surfSumChart.unload({
        ids: ["2013"],
      });
      windSumChart.unload({
        ids: ["2013"],
      });
      $("#weather2013").css('color', 'white');
    }
  });
  $("#weather2012").on("click", function() {
    color2012 = $("#weather2012").css('color');
    if (color2012 == 'rgb(255, 255, 255)') {
      // Weather Data
      weatherData2012 = [];
      weatherData2012pcMean = ["2012"];
      weatherData2012pcSum = ["2012"];
      weatherData2012atempMean = ["2012"];
      weatherData2012atempSum = ["2012"];
      weatherData2012surfMean = ["2012"];
      weatherData2012surfSum = ["2012"];
      weatherData2012windMean = ["2012"];
      weatherData2012windSum = ["2012"];

      var weatherVars = {
        name: "Precip",
        pcM2012: weatherData2012pcMean,
        pcS2012: weatherData2012pcSum,
        atempM2012: weatherData2012atempMean,
        atempS2012: weatherData2012atempSum,
        surfM2012: weatherData2012surfMean,
        surfS2012: weatherData2012surfSum,
        windM2012: weatherData2012windMean,
        windS2012: weatherData2012windSum,
      }

      varsCounts(weatherVars);

      precipSubChart.load({
        columns: [weatherVars.pcM2012],
      });
      precipChart.load({
        columns: [weatherVars.pcM2012],
      });
      aitTempChart.load({
        columns: [weatherVars.atempM2012],
      });
      surfChart.load({
        columns: [weatherVars.surfM2012],
      });
      windChart.load({
        columns: [weatherVars.windM2012],
      });
      precipSumSubChart.load({
        columns: [weatherVars.pcS2012],
      });
      precipSumChart.load({
        columns: [weatherVars.pcS2012],
      });
      aitTempSumChart.load({
        columns: [weatherVars.atempS2012],
      });
      surfSumChart.load({
        columns: [weatherVars.surfS2012],
      });
      windSumChart.load({
        columns: [weatherVars.windS2012],
      });

      var stroke = precipSubChart.color('2012');
      $("#weather2012").css('color', stroke);
    } else {
      precipSubChart.unload({
        ids: ["2012"],
      });
      precipChart.unload({
        ids: ["2012"],
      });
      aitTempChart.unload({
        ids: ["2012"],
      });
      surfChart.unload({
        ids: ["2012"],
      });
      windChart.unload({
        ids: ["2012"],
      });
      precipSumSubChart.unload({
        ids: ["2012"],
      });
      precipSumChart.unload({
        ids: ["2012"],
      });
      aitTempSumChart.unload({
        ids: ["2012"],
      });
      surfSumChart.unload({
        ids: ["2012"],
      });
      windSumChart.unload({
        ids: ["2012"],
      });
      $("#weather2012").css('color', 'white');
    }
  });

  // Sample Year Selection
  $("#sample2019").on("click", function() {
    color2019 = $("#sample2019").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2019 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2019],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2019],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2019],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2019],
      });
      var stroke = sampleSubChart.color('2019');
      $("#sample2019").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2019"],
      });
      sampleChart.unload({
        ids: ["2019"],
      });
      toxinChart.unload({
        ids: ["2019"],
      });
      nitrateChart.unload({
        ids: ["2019"],
      });

      $("#sample2019").css('color', 'white');
    }

  });
  $("#sample2018").on("click", function() {
    color2018 = $("#sample2018").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2018 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2018],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2018],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2018],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2018],
      });
      var stroke = sampleSubChart.color('2018');
      $("#sample2018").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2018"],
      });
      sampleChart.unload({
        ids: ["2018"],
      });
      toxinChart.unload({
        ids: ["2018"],
      });
      nitrateChart.unload({
        ids: ["2018"],
      });

      $("#sample2018").css('color', 'white');
    }

  });
  $("#sample2017").on("click", function() {
    color2017 = $("#sample2017").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2017 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2017],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2017],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2017],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2017],
      });
      var stroke = sampleSubChart.color('2017');
      $("#sample2017").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2017"],
      });
      sampleChart.unload({
        ids: ["2017"],
      });
      toxinChart.unload({
        ids: ["2017"],
      });
      nitrateChart.unload({
        ids: ["2017"],
      });

      $("#sample2017").css('color', 'white');
    }

  });
  $("#sample2016").on("click", function() {
    color2016 = $("#sample2016").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2016 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2016],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2016],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2016],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2016],
      });
      var stroke = sampleSubChart.color('2016');
      $("#sample2016").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2016"],
      });
      sampleChart.unload({
        ids: ["2016"],
      });
      toxinChart.unload({
        ids: ["2016"],
      });
      nitrateChart.unload({
        ids: ["2016"],
      });

      $("#sample2016").css('color', 'white');
    }

  });
  $("#sample2015").on("click", function() {
    color2015 = $("#sample2015").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2015 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2015],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2015],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2015],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2015],
      });
      var stroke = sampleSubChart.color('2015');
      $("#sample2015").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2015"],
      });
      sampleChart.unload({
        ids: ["2015"],
      });
      toxinChart.unload({
        ids: ["2015"],
      });
      nitrateChart.unload({
        ids: ["2015"],
      });

      $("#sample2015").css('color', 'white');
    }

  });
  $("#sample2014").on("click", function() {
    color2014 = $("#sample2014").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2014 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2014],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2014],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2014],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2014],
      });
      var stroke = sampleSubChart.color('2014');
      $("#sample2014").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2014"],
      });
      sampleChart.unload({
        ids: ["2014"],
      });
      toxinChart.unload({
        ids: ["2014"],
      });
      nitrateChart.unload({
        ids: ["2014"],
      });

      $("#sample2014").css('color', 'white');
    }

  });
  $("#sample2013").on("click", function() {
    color2013 = $("#sample2013").css('color');
    sampleSite = $("#sampleDropdown").text();
    if (color2013 == 'rgb(255, 255, 255)') {
      // Weather Data
      var wst = ["Date"];
      var wst2016 = ["Date"];
      var wst2017 = ["Date"];
      var wst2018 = ["Date"];
      var wst2019 = ["Date"];
      var wstt = ["Date"];
      var wstt2016 = ["Date"];
      var wstt2017 = ["Date"];
      var wstt2018 = ["Date"];
      var wstt2019 = ["Date"];
      var wsnt = ["Date"];
      var wsnt2016 = ["Date"];
      var wsnt2017 = ["Date"];
      var wsnt2018 = ["Date"];
      var wsnt2019 = ["Date"];
      var algae = ["Algae"];
      var algae2016 = ["2016"];
      var algae2017 = ["2017"];
      var algae2018 = ["2018"];
      var algae2019 = ["2019"];
      var toxin = ["Toxins"];
      var toxin2016 = ["2016"];
      var toxin2017 = ["2017"];
      var toxin2018 = ["2018"];
      var toxin2019 = ["2019"];
      var nitrate = ["Total Nitrate"];
      var nitrate2016 = ["2016"];
      var nitrate2017 = ["2017"];
      var nitrate2018 = ["2018"];
      var nitrate2019 = ["2019"];
      // var negTests = ["Negative Tests"];
      var sampleSiteSelect = {
        name: sampleSite,
        a: algae,
        a2016: algae2016,
        a2017: algae2017,
        a2018: algae2018,
        a2019: algae2019,
        t: toxin,
        t2016: toxin2016,
        t2017: toxin2017,
        t2018: toxin2018,
        t2019: toxin2019,
        n: nitrate,
        n2016: nitrate2016,
        n2017: nitrate2017,
        n2018: nitrate2018,
        n2019: nitrate2019,
      }

      sampleSiteCounts(sampleSiteSelect);

      sampleSubChart.load({
        columns: [sampleSiteSelect.a2013],
      });
      sampleChart.load({
        columns: [sampleSiteSelect.a2013],
      });
      toxinChart.load({
        columns: [sampleSiteSelect.t2013],
      });
      nitrateChart.load({
        columns: [sampleSiteSelect.n2013],
      });
      var stroke = sampleSubChart.color('2013');
      $("#sample2013").css('color', stroke);

    } else {
      sampleSubChart.unload({
        ids: ["2013"],
      });
      sampleChart.unload({
        ids: ["2013"],
      });
      toxinChart.unload({
        ids: ["2013"],
      });
      nitrateChart.unload({
        ids: ["2013"],
      });

      $("#sample2013").css('color', 'white');
    }

  });

  // SteamGage Site Dropdown Interaction
  $("#14179000").on("click", function() {
    $("#gageDropdown").text("BREITENBUSH R ABV FRENCH CR NR DETROIT, OR");

    var t = ["Date"];
    var t2020 = ["Date"];
    var t2021 = ["Date"];
    var water_temp = ["Water Temperature"];
    var water_temp2020 = ["2020"];
    var water_temp2021 = ["2021"];
    streamGage1Data2022 = [];
    streamGage1Data2022wtMean = ["2022"];
    streamGage1Data2022wtSum = ["2022"];
    streamGage1Data2022dchMean = ["2022"];
    streamGage1Data2022dchSum = ["2022"];
    streamGage1Data2021 = [];
    streamGage1Data2021wtMean = ["2021"];
    streamGage1Data2021wtSum = ["2021"];
    streamGage1Data2021dchMean = ["2021"];
    streamGage1Data2021dchSum = ["2021"];
    streamGage1Data2020 = [];
    streamGage1Data2020wtMean = ["2020"];
    streamGage1Data2020wtSum = ["2020"];
    streamGage1Data2020dchMean = ["2020"];
    streamGage1Data2020dchSum = ["2020"];
    streamGage1Data2019 = [];
    streamGage1Data2019wtMean = ["2019"];
    streamGage1Data2019wtSum = ["2019"];
    streamGage1Data2019dchMean = ["2019"];
    streamGage1Data2019dchSum = ["2019"];
    streamGage1Data2018 = [];
    streamGage1Data2018wtMean = ["2018"];
    streamGage1Data2018wtSum = ["2018"];
    streamGage1Data2018dchMean = ["2018"];
    streamGage1Data2018dchSum = ["2018"];
    streamGage1Data2017 = [];
    streamGage1Data2017wtMean = ["2017"];
    streamGage1Data2017wtSum = ["2017"];
    streamGage1Data2017dchMean = ["2017"];
    streamGage1Data2017dchSum = ["2017"];
    streamGage1Data2016 = [];
    streamGage1Data2016wtMean = ["2016"];
    streamGage1Data2016wtSum = ["2016"];
    streamGage1Data2016dchMean = ["2016"];
    streamGage1Data2016dchSum = ["2016"];
    streamGage1Data2015 = [];
    streamGage1Data2015wtMean = ["2015"];
    streamGage1Data2015wtSum = ["2015"];
    streamGage1Data2015dchMean = ["2015"];
    streamGage1Data2015dchSum = ["2015"];
    streamGage1Data2014 = [];
    streamGage1Data2014wtMean = ["2014"];
    streamGage1Data2014wtSum = ["2014"];
    streamGage1Data2014dchMean = ["2014"];
    streamGage1Data2014dchSum = ["2014"];
    streamGage1Data2013 = [];
    streamGage1Data2013wtMean = ["2013"];
    streamGage1Data2013wtSum = ["2013"];
    streamGage1Data2013dchMean = ["2013"];
    streamGage1Data2013dchSum = ["2013"];
    streamGage1Data2012 = [];
    streamGage1Data2012wtMean = ["2012"];
    streamGage1Data2012wtSum = ["2012"];
    streamGage1Data2012dchMean = ["2012"];
    streamGage1Data2012dchSum = ["2012"];
    streamGage1Data2011 = [];
    streamGage1Data2011wtMean = ["2011"];
    streamGage1Data2011wtSum = ["2011"];
    streamGage1Data2011dchMean = ["2011"];
    streamGage1Data2011dchSum = ["2011"];
    streamGage1Data2010 = [];
    streamGage1Data2010wtMean = ["2010"];
    streamGage1Data2010wtSum = ["2010"];
    streamGage1Data2010dchMean = ["2010"];
    streamGage1Data2010dchSum = ["2010"];

    gageID = "14179000";
    var siteSelect = {
      name: gageID,
      wt: water_temp,
      wt2020: water_temp2020,
      wt2021: water_temp2021,
      wtM2022: streamGage1Data2022wtMean,
      wtS2022: streamGage1Data2022wtSum,
      dchM2022: streamGage1Data2022dchMean,
      dchS2022: streamGage1Data2022dchSum,
      wtM2021: streamGage1Data2021wtMean,
      wtS2021: streamGage1Data2021wtSum,
      dchM2021: streamGage1Data2021dchMean,
      dchS2021: streamGage1Data2021dchSum,
      wtM2020: streamGage1Data2020wtMean,
      wtS2020: streamGage1Data2020wtSum,
      dchM2020: streamGage1Data2020dchMean,
      dchS2020: streamGage1Data2020dchSum,
      wtM2019: streamGage1Data2019wtMean,
      wtS2019: streamGage1Data2019wtSum,
      dchM2019: streamGage1Data2019dchMean,
      dchS2019: streamGage1Data2019dchSum,
      wtM2018: streamGage1Data2018wtMean,
      wtS2018: streamGage1Data2018wtSum,
      dchM2018: streamGage1Data2018dchMean,
      dchS2018: streamGage1Data2018dchSum,
      wtM2017: streamGage1Data2017wtMean,
      wtS2017: streamGage1Data2017wtSum,
      dchM2017: streamGage1Data2017dchMean,
      dchS2017: streamGage1Data2017dchSum,
      wtM2016: streamGage1Data2016wtMean,
      wtS2016: streamGage1Data2016wtSum,
      dchM2016: streamGage1Data2016dchMean,
      dchS2016: streamGage1Data2016dchSum,
      wtM2015: streamGage1Data2015wtMean,
      wtS2015: streamGage1Data2015wtSum,
      dchM2015: streamGage1Data2015dchMean,
      dchS2015: streamGage1Data2015dchSum,
      wtM2014: streamGage1Data2014wtMean,
      wtS2014: streamGage1Data2014wtSum,
      dchM2014: streamGage1Data2014dchMean,
      dchS2014: streamGage1Data2014dchSum,
      wtM2013: streamGage1Data2013wtMean,
      wtS2013: streamGage1Data2013wtSum,
      dchM2013: streamGage1Data2013dchMean,
      dchS2013: streamGage1Data2013dchSum,
      wtM2012: streamGage1Data2012wtMean,
      wtS2012: streamGage1Data2012wtSum,
      dchM2012: streamGage1Data2012dchMean,
      dchS2012: streamGage1Data2012dchSum,
      wtM2011: streamGage1Data2011wtMean,
      wtS2011: streamGage1Data2011wtSum,
      dchM2011: streamGage1Data2011dchMean,
      dchS2011: streamGage1Data2011dchSum,
      wtM2010: streamGage1Data2010wtMean,
      wtS2010: streamGage1Data2010wtSum,
      dchM2010: streamGage1Data2010dchMean,
      dchS2010: streamGage1Data2010dchSum,
    }

    siteCounts(siteSelect);


    chart.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    chart2.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    h20SumChart.load({
      unload: true,
      columns: [siteSelect.wtS2022, siteSelect.wtS2021, siteSelect.wtS2020],
    });
    dchMeanChart.load({
      unload: true,
      columns: [siteSelect.dchM2022, siteSelect.dchM2021, siteSelect.dchM2020],
    });
    dchSumChart.load({
      unload: true,
      columns: [siteSelect.dchS2022, siteSelect.dchS2021, siteSelect.dchS2020],
    });
    $("#gage-chart > svg > g:nth-child(2)").hide();

    $("#gage2019").css('color', 'white');
    $("#gage2018").css('color', 'white');
    $("#gage2017").css('color', 'white');
    $("#gage2016").css('color', 'white');
    $("#gage2015").css('color', 'white');
    $("#gage2014").css('color', 'white');
    $("#gage2013").css('color', 'white');
    $("#gage2012").css('color', 'white');
    $("#gage2011").css('color', 'white');
    $("#gage2010").css('color', 'white');
    $("#gage-chart > svg > g:nth-child(2)").hide();
  });
  $("#14178000").on("click", function() {
    $("#gageDropdown").text("NO SANTIAM R BLW BOULDER CRK, NR DETROIT, OR");

    var t = ["Date"];
    var t2020 = ["Date"];
    var t2021 = ["Date"];
    var water_temp = ["Water Temperature"];
    var water_temp2020 = ["2020"];
    var water_temp2021 = ["2021"];
    streamGage1Data2022 = [];
    streamGage1Data2022wtMean = ["2022"];
    streamGage1Data2022wtSum = ["2022"];
    streamGage1Data2022dchMean = ["2022"];
    streamGage1Data2022dchSum = ["2022"];
    streamGage1Data2021 = [];
    streamGage1Data2021wtMean = ["2021"];
    streamGage1Data2021wtSum = ["2021"];
    streamGage1Data2021dchMean = ["2021"];
    streamGage1Data2021dchSum = ["2021"];
    streamGage1Data2020 = [];
    streamGage1Data2020wtMean = ["2020"];
    streamGage1Data2020wtSum = ["2020"];
    streamGage1Data2020dchMean = ["2020"];
    streamGage1Data2020dchSum = ["2020"];
    streamGage1Data2019 = [];
    streamGage1Data2019wtMean = ["2019"];
    streamGage1Data2019wtSum = ["2019"];
    streamGage1Data2019dchMean = ["2019"];
    streamGage1Data2019dchSum = ["2019"];
    streamGage1Data2018 = [];
    streamGage1Data2018wtMean = ["2018"];
    streamGage1Data2018wtSum = ["2018"];
    streamGage1Data2018dchMean = ["2018"];
    streamGage1Data2018dchSum = ["2018"];
    streamGage1Data2017 = [];
    streamGage1Data2017wtMean = ["2017"];
    streamGage1Data2017wtSum = ["2017"];
    streamGage1Data2017dchMean = ["2017"];
    streamGage1Data2017dchSum = ["2017"];
    streamGage1Data2016 = [];
    streamGage1Data2016wtMean = ["2016"];
    streamGage1Data2016wtSum = ["2016"];
    streamGage1Data2016dchMean = ["2016"];
    streamGage1Data2016dchSum = ["2016"];
    streamGage1Data2015 = [];
    streamGage1Data2015wtMean = ["2015"];
    streamGage1Data2015wtSum = ["2015"];
    streamGage1Data2015dchMean = ["2015"];
    streamGage1Data2015dchSum = ["2015"];
    streamGage1Data2014 = [];
    streamGage1Data2014wtMean = ["2014"];
    streamGage1Data2014wtSum = ["2014"];
    streamGage1Data2014dchMean = ["2014"];
    streamGage1Data2014dchSum = ["2014"];
    streamGage1Data2013 = [];
    streamGage1Data2013wtMean = ["2013"];
    streamGage1Data2013wtSum = ["2013"];
    streamGage1Data2013dchMean = ["2013"];
    streamGage1Data2013dchSum = ["2013"];
    streamGage1Data2012 = [];
    streamGage1Data2012wtMean = ["2012"];
    streamGage1Data2012wtSum = ["2012"];
    streamGage1Data2012dchMean = ["2012"];
    streamGage1Data2012dchSum = ["2012"];
    streamGage1Data2011 = [];
    streamGage1Data2011wtMean = ["2011"];
    streamGage1Data2011wtSum = ["2011"];
    streamGage1Data2011dchMean = ["2011"];
    streamGage1Data2011dchSum = ["2011"];
    streamGage1Data2010 = [];
    streamGage1Data2010wtMean = ["2010"];
    streamGage1Data2010wtSum = ["2010"];
    streamGage1Data2010dchMean = ["2010"];
    streamGage1Data2010dchSum = ["2010"];

    gageID = "14178000";
    var siteSelect = {
      name: gageID,
      wt: water_temp,
      wt2020: water_temp2020,
      wt2021: water_temp2021,
      wtM2022: streamGage1Data2022wtMean,
      wtS2022: streamGage1Data2022wtSum,
      dchM2022: streamGage1Data2022dchMean,
      dchS2022: streamGage1Data2022dchSum,
      wtM2021: streamGage1Data2021wtMean,
      wtS2021: streamGage1Data2021wtSum,
      dchM2021: streamGage1Data2021dchMean,
      dchS2021: streamGage1Data2021dchSum,
      wtM2020: streamGage1Data2020wtMean,
      wtS2020: streamGage1Data2020wtSum,
      dchM2020: streamGage1Data2020dchMean,
      dchS2020: streamGage1Data2020dchSum,
      wtM2019: streamGage1Data2019wtMean,
      wtS2019: streamGage1Data2019wtSum,
      dchM2019: streamGage1Data2019dchMean,
      dchS2019: streamGage1Data2019dchSum,
      wtM2018: streamGage1Data2018wtMean,
      wtS2018: streamGage1Data2018wtSum,
      dchM2018: streamGage1Data2018dchMean,
      dchS2018: streamGage1Data2018dchSum,
      wtM2017: streamGage1Data2017wtMean,
      wtS2017: streamGage1Data2017wtSum,
      dchM2017: streamGage1Data2017dchMean,
      dchS2017: streamGage1Data2017dchSum,
      wtM2016: streamGage1Data2016wtMean,
      wtS2016: streamGage1Data2016wtSum,
      dchM2016: streamGage1Data2016dchMean,
      dchS2016: streamGage1Data2016dchSum,
      wtM2015: streamGage1Data2015wtMean,
      wtS2015: streamGage1Data2015wtSum,
      dchM2015: streamGage1Data2015dchMean,
      dchS2015: streamGage1Data2015dchSum,
      wtM2014: streamGage1Data2014wtMean,
      wtS2014: streamGage1Data2014wtSum,
      dchM2014: streamGage1Data2014dchMean,
      dchS2014: streamGage1Data2014dchSum,
      wtM2013: streamGage1Data2013wtMean,
      wtS2013: streamGage1Data2013wtSum,
      dchM2013: streamGage1Data2013dchMean,
      dchS2013: streamGage1Data2013dchSum,
      wtM2012: streamGage1Data2012wtMean,
      wtS2012: streamGage1Data2012wtSum,
      dchM2012: streamGage1Data2012dchMean,
      dchS2012: streamGage1Data2012dchSum,
      wtM2011: streamGage1Data2011wtMean,
      wtS2011: streamGage1Data2011wtSum,
      dchM2011: streamGage1Data2011dchMean,
      dchS2011: streamGage1Data2011dchSum,
      wtM2010: streamGage1Data2010wtMean,
      wtS2010: streamGage1Data2010wtSum,
      dchM2010: streamGage1Data2010dchMean,
      dchS2010: streamGage1Data2010dchSum,
    }

    siteCounts(siteSelect);


    chart.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    chart2.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    h20SumChart.load({
      unload: true,
      columns: [siteSelect.wtS2022, siteSelect.wtS2021, siteSelect.wtS2020],
    });
    dchMeanChart.load({
      unload: true,
      columns: [siteSelect.dchM2022, siteSelect.dchM2021, siteSelect.dchM2020],
    });
    dchSumChart.load({
      unload: true,
      columns: [siteSelect.dchS2022, siteSelect.dchS2021, siteSelect.dchS2020],
    });
    $("#gage-chart > svg > g:nth-child(2)").hide();

    // $("#deck-2 > div.col-lg-2 > center > div:nth-child(4) > label").css('color', 'white');

    $("#gage2019").css('color', 'white');
    $("#gage2018").css('color', 'white');
    $("#gage2017").css('color', 'white');
    $("#gage2016").css('color', 'white');
    $("#gage2015").css('color', 'white');
    $("#gage2014").css('color', 'white');
    $("#gage2013").css('color', 'white');
    $("#gage2012").css('color', 'white');
    $("#gage2011").css('color', 'white');
    $("#gage2010").css('color', 'white');
    $("#gage-chart > svg > g:nth-child(2)").hide();
  });
  $("#14180300").on("click", function() {
    $("#gageDropdown").text("BLOWOUT CREEK NEAR DETROIT, OR");

    var t = ["Date"];
    var t2020 = ["Date"];
    var t2021 = ["Date"];
    var water_temp = ["Water Temperature"];
    var water_temp2020 = ["2020"];
    var water_temp2021 = ["2021"];
    streamGage1Data2022 = [];
    streamGage1Data2022wtMean = ["2022"];
    streamGage1Data2022wtSum = ["2022"];
    streamGage1Data2022dchMean = ["2022"];
    streamGage1Data2022dchSum = ["2022"];
    streamGage1Data2021 = [];
    streamGage1Data2021wtMean = ["2021"];
    streamGage1Data2021wtSum = ["2021"];
    streamGage1Data2021dchMean = ["2021"];
    streamGage1Data2021dchSum = ["2021"];
    streamGage1Data2020 = [];
    streamGage1Data2020wtMean = ["2020"];
    streamGage1Data2020wtSum = ["2020"];
    streamGage1Data2020dchMean = ["2020"];
    streamGage1Data2020dchSum = ["2020"];
    streamGage1Data2019 = [];
    streamGage1Data2019wtMean = ["2019"];
    streamGage1Data2019wtSum = ["2019"];
    streamGage1Data2019dchMean = ["2019"];
    streamGage1Data2019dchSum = ["2019"];
    streamGage1Data2018 = [];
    streamGage1Data2018wtMean = ["2018"];
    streamGage1Data2018wtSum = ["2018"];
    streamGage1Data2018dchMean = ["2018"];
    streamGage1Data2018dchSum = ["2018"];
    streamGage1Data2017 = [];
    streamGage1Data2017wtMean = ["2017"];
    streamGage1Data2017wtSum = ["2017"];
    streamGage1Data2017dchMean = ["2017"];
    streamGage1Data2017dchSum = ["2017"];
    streamGage1Data2016 = [];
    streamGage1Data2016wtMean = ["2016"];
    streamGage1Data2016wtSum = ["2016"];
    streamGage1Data2016dchMean = ["2016"];
    streamGage1Data2016dchSum = ["2016"];
    streamGage1Data2015 = [];
    streamGage1Data2015wtMean = ["2015"];
    streamGage1Data2015wtSum = ["2015"];
    streamGage1Data2015dchMean = ["2015"];
    streamGage1Data2015dchSum = ["2015"];
    streamGage1Data2014 = [];
    streamGage1Data2014wtMean = ["2014"];
    streamGage1Data2014wtSum = ["2014"];
    streamGage1Data2014dchMean = ["2014"];
    streamGage1Data2014dchSum = ["2014"];
    streamGage1Data2013 = [];
    streamGage1Data2013wtMean = ["2013"];
    streamGage1Data2013wtSum = ["2013"];
    streamGage1Data2013dchMean = ["2013"];
    streamGage1Data2013dchSum = ["2013"];
    streamGage1Data2012 = [];
    streamGage1Data2012wtMean = ["2012"];
    streamGage1Data2012wtSum = ["2012"];
    streamGage1Data2012dchMean = ["2012"];
    streamGage1Data2012dchSum = ["2012"];
    streamGage1Data2011 = [];
    streamGage1Data2011wtMean = ["2011"];
    streamGage1Data2011wtSum = ["2011"];
    streamGage1Data2011dchMean = ["2011"];
    streamGage1Data2011dchSum = ["2011"];
    streamGage1Data2010 = [];
    streamGage1Data2010wtMean = ["2010"];
    streamGage1Data2010wtSum = ["2010"];
    streamGage1Data2010dchMean = ["2010"];
    streamGage1Data2010dchSum = ["2010"];

    gageID = "14180300";
    var siteSelect = {
      name: gageID,
      wt: water_temp,
      wt2020: water_temp2020,
      wt2021: water_temp2021,
      wtM2022: streamGage1Data2022wtMean,
      wtS2022: streamGage1Data2022wtSum,
      dchM2022: streamGage1Data2022dchMean,
      dchS2022: streamGage1Data2022dchSum,
      wtM2021: streamGage1Data2021wtMean,
      wtS2021: streamGage1Data2021wtSum,
      dchM2021: streamGage1Data2021dchMean,
      dchS2021: streamGage1Data2021dchSum,
      wtM2020: streamGage1Data2020wtMean,
      wtS2020: streamGage1Data2020wtSum,
      dchM2020: streamGage1Data2020dchMean,
      dchS2020: streamGage1Data2020dchSum,
      wtM2019: streamGage1Data2019wtMean,
      wtS2019: streamGage1Data2019wtSum,
      dchM2019: streamGage1Data2019dchMean,
      dchS2019: streamGage1Data2019dchSum,
      wtM2018: streamGage1Data2018wtMean,
      wtS2018: streamGage1Data2018wtSum,
      dchM2018: streamGage1Data2018dchMean,
      dchS2018: streamGage1Data2018dchSum,
      wtM2017: streamGage1Data2017wtMean,
      wtS2017: streamGage1Data2017wtSum,
      dchM2017: streamGage1Data2017dchMean,
      dchS2017: streamGage1Data2017dchSum,
      wtM2016: streamGage1Data2016wtMean,
      wtS2016: streamGage1Data2016wtSum,
      dchM2016: streamGage1Data2016dchMean,
      dchS2016: streamGage1Data2016dchSum,
      wtM2015: streamGage1Data2015wtMean,
      wtS2015: streamGage1Data2015wtSum,
      dchM2015: streamGage1Data2015dchMean,
      dchS2015: streamGage1Data2015dchSum,
      wtM2014: streamGage1Data2014wtMean,
      wtS2014: streamGage1Data2014wtSum,
      dchM2014: streamGage1Data2014dchMean,
      dchS2014: streamGage1Data2014dchSum,
      wtM2013: streamGage1Data2013wtMean,
      wtS2013: streamGage1Data2013wtSum,
      dchM2013: streamGage1Data2013dchMean,
      dchS2013: streamGage1Data2013dchSum,
      wtM2012: streamGage1Data2012wtMean,
      wtS2012: streamGage1Data2012wtSum,
      dchM2012: streamGage1Data2012dchMean,
      dchS2012: streamGage1Data2012dchSum,
      wtM2011: streamGage1Data2011wtMean,
      wtS2011: streamGage1Data2011wtSum,
      dchM2011: streamGage1Data2011dchMean,
      dchS2011: streamGage1Data2011dchSum,
      wtM2010: streamGage1Data2010wtMean,
      wtS2010: streamGage1Data2010wtSum,
      dchM2010: streamGage1Data2010dchMean,
      dchS2010: streamGage1Data2010dchSum,
    }

    siteCounts(siteSelect);


    chart.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    chart2.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    h20SumChart.load({
      unload: true,
      columns: [siteSelect.wtS2022, siteSelect.wtS2021, siteSelect.wtS2020],
    });
    dchMeanChart.load({
      unload: true,
      columns: [siteSelect.dchM2022, siteSelect.dchM2021, siteSelect.dchM2020],
    });
    dchSumChart.load({
      unload: true,
      columns: [siteSelect.dchS2022, siteSelect.dchS2021, siteSelect.dchS2020],
    });
    $("#gage-chart > svg > g:nth-child(2)").hide();

    // $("#deck-2 > div.col-lg-2 > center > div:nth-child(4) > label").css('color', 'white');
    // $("#gage2020").css('color', 'white');
    $("#gage2019").css('color', 'white');
    $("#gage2018").css('color', 'white');
    $("#gage2017").css('color', 'white');
    $("#gage2016").css('color', 'white');
    $("#gage2015").css('color', 'white');
    $("#gage2014").css('color', 'white');
    $("#gage2013").css('color', 'white');
    $("#gage2012").css('color', 'white');
    $("#gage2011").css('color', 'white');
    $("#gage2010").css('color', 'white');
    $("#gage-chart > svg > g:nth-child(2)").hide();
  });
  $("#14181500").on("click", function() {
    $("#gageDropdown").text("NORTH SANTIAM RIVER AT NIAGARA, OR");

    var t = ["Date"];
    var t2020 = ["Date"];
    var t2021 = ["Date"];
    var water_temp = ["Water Temperature"];
    var water_temp2020 = ["2020"];
    var water_temp2021 = ["2021"];
    streamGage1Data2022 = [];
    streamGage1Data2022wtMean = ["2022"];
    streamGage1Data2022wtSum = ["2022"];
    streamGage1Data2022dchMean = ["2022"];
    streamGage1Data2022dchSum = ["2022"];
    streamGage1Data2021 = [];
    streamGage1Data2021wtMean = ["2021"];
    streamGage1Data2021wtSum = ["2021"];
    streamGage1Data2021dchMean = ["2021"];
    streamGage1Data2021dchSum = ["2021"];
    streamGage1Data2020 = [];
    streamGage1Data2020wtMean = ["2020"];
    streamGage1Data2020wtSum = ["2020"];
    streamGage1Data2020dchMean = ["2020"];
    streamGage1Data2020dchSum = ["2020"];
    streamGage1Data2019 = [];
    streamGage1Data2019wtMean = ["2019"];
    streamGage1Data2019wtSum = ["2019"];
    streamGage1Data2019dchMean = ["2019"];
    streamGage1Data2019dchSum = ["2019"];
    streamGage1Data2018 = [];
    streamGage1Data2018wtMean = ["2018"];
    streamGage1Data2018wtSum = ["2018"];
    streamGage1Data2018dchMean = ["2018"];
    streamGage1Data2018dchSum = ["2018"];
    streamGage1Data2017 = [];
    streamGage1Data2017wtMean = ["2017"];
    streamGage1Data2017wtSum = ["2017"];
    streamGage1Data2017dchMean = ["2017"];
    streamGage1Data2017dchSum = ["2017"];
    streamGage1Data2016 = [];
    streamGage1Data2016wtMean = ["2016"];
    streamGage1Data2016wtSum = ["2016"];
    streamGage1Data2016dchMean = ["2016"];
    streamGage1Data2016dchSum = ["2016"];
    streamGage1Data2015 = [];
    streamGage1Data2015wtMean = ["2015"];
    streamGage1Data2015wtSum = ["2015"];
    streamGage1Data2015dchMean = ["2015"];
    streamGage1Data2015dchSum = ["2015"];
    streamGage1Data2014 = [];
    streamGage1Data2014wtMean = ["2014"];
    streamGage1Data2014wtSum = ["2014"];
    streamGage1Data2014dchMean = ["2014"];
    streamGage1Data2014dchSum = ["2014"];
    streamGage1Data2013 = [];
    streamGage1Data2013wtMean = ["2013"];
    streamGage1Data2013wtSum = ["2013"];
    streamGage1Data2013dchMean = ["2013"];
    streamGage1Data2013dchSum = ["2013"];
    streamGage1Data2012 = [];
    streamGage1Data2012wtMean = ["2012"];
    streamGage1Data2012wtSum = ["2012"];
    streamGage1Data2012dchMean = ["2012"];
    streamGage1Data2012dchSum = ["2012"];
    streamGage1Data2011 = [];
    streamGage1Data2011wtMean = ["2011"];
    streamGage1Data2011wtSum = ["2011"];
    streamGage1Data2011dchMean = ["2011"];
    streamGage1Data2011dchSum = ["2011"];
    streamGage1Data2010 = [];
    streamGage1Data2010wtMean = ["2010"];
    streamGage1Data2010wtSum = ["2010"];
    streamGage1Data2010dchMean = ["2010"];
    streamGage1Data2010dchSum = ["2010"];

    gageID = "14181500";
    var siteSelect = {
      name: gageID,
      wt: water_temp,
      wt2020: water_temp2020,
      wt2021: water_temp2021,
      wtM2022: streamGage1Data2022wtMean,
      wtS2022: streamGage1Data2022wtSum,
      dchM2022: streamGage1Data2022dchMean,
      dchS2022: streamGage1Data2022dchSum,
      wtM2021: streamGage1Data2021wtMean,
      wtS2021: streamGage1Data2021wtSum,
      dchM2021: streamGage1Data2021dchMean,
      dchS2021: streamGage1Data2021dchSum,
      wtM2020: streamGage1Data2020wtMean,
      wtS2020: streamGage1Data2020wtSum,
      dchM2020: streamGage1Data2020dchMean,
      dchS2020: streamGage1Data2020dchSum,
      wtM2019: streamGage1Data2019wtMean,
      wtS2019: streamGage1Data2019wtSum,
      dchM2019: streamGage1Data2019dchMean,
      dchS2019: streamGage1Data2019dchSum,
      wtM2018: streamGage1Data2018wtMean,
      wtS2018: streamGage1Data2018wtSum,
      dchM2018: streamGage1Data2018dchMean,
      dchS2018: streamGage1Data2018dchSum,
      wtM2017: streamGage1Data2017wtMean,
      wtS2017: streamGage1Data2017wtSum,
      dchM2017: streamGage1Data2017dchMean,
      dchS2017: streamGage1Data2017dchSum,
      wtM2016: streamGage1Data2016wtMean,
      wtS2016: streamGage1Data2016wtSum,
      dchM2016: streamGage1Data2016dchMean,
      dchS2016: streamGage1Data2016dchSum,
      wtM2015: streamGage1Data2015wtMean,
      wtS2015: streamGage1Data2015wtSum,
      dchM2015: streamGage1Data2015dchMean,
      dchS2015: streamGage1Data2015dchSum,
      wtM2014: streamGage1Data2014wtMean,
      wtS2014: streamGage1Data2014wtSum,
      dchM2014: streamGage1Data2014dchMean,
      dchS2014: streamGage1Data2014dchSum,
      wtM2013: streamGage1Data2013wtMean,
      wtS2013: streamGage1Data2013wtSum,
      dchM2013: streamGage1Data2013dchMean,
      dchS2013: streamGage1Data2013dchSum,
      wtM2012: streamGage1Data2012wtMean,
      wtS2012: streamGage1Data2012wtSum,
      dchM2012: streamGage1Data2012dchMean,
      dchS2012: streamGage1Data2012dchSum,
      wtM2011: streamGage1Data2011wtMean,
      wtS2011: streamGage1Data2011wtSum,
      dchM2011: streamGage1Data2011dchMean,
      dchS2011: streamGage1Data2011dchSum,
      wtM2010: streamGage1Data2010wtMean,
      wtS2010: streamGage1Data2010wtSum,
      dchM2010: streamGage1Data2010dchMean,
      dchS2010: streamGage1Data2010dchSum,
    }

    siteCounts(siteSelect);


    chart.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    chart2.load({
      unload: true,
      columns: [siteSelect.wtM2022, siteSelect.wtM2021, siteSelect.wtM2020],
    });
    h20SumChart.load({
      unload: true,
      columns: [siteSelect.wtS2022, siteSelect.wtS2021, siteSelect.wtS2020],
    });
    dchMeanChart.load({
      unload: true,
      columns: [siteSelect.dchM2022, siteSelect.dchM2021, siteSelect.dchM2020],
    });
    dchSumChart.load({
      unload: true,
      columns: [siteSelect.dchS2022, siteSelect.dchS2021, siteSelect.dchS2020],
    });
    $("#gage-chart > svg > g:nth-child(2)").hide();

    // $("#deck-2 > div.col-lg-2 > center > div:nth-child(4) > label").css('color', 'white');
    // $("#gage2020").css('color', 'white');
    $("#gage2019").css('color', 'white');
    $("#gage2018").css('color', 'white');
    $("#gage2017").css('color', 'white');
    $("#gage2016").css('color', 'white');
    $("#gage2015").css('color', 'white');
    $("#gage2014").css('color', 'white');
    $("#gage2013").css('color', 'white');
    $("#gage2012").css('color', 'white');
    $("#gage2011").css('color', 'white');
    $("#gage2010").css('color', 'white');
    $("#gage-chart > svg > g:nth-child(2)").hide();
  });

  // Sample Site Dropdown Interaction
  $("#Log_Boom").on("click", function() {
    $("#sampleDropdown").text("Log Boom");

    var wst = ["Date"];
    var wst2016 = ["Date"];
    var wst2017 = ["Date"];
    var wst2018 = ["Date"];
    var wst2019 = ["Date"];
    var wstt = ["Date"];
    var wstt2016 = ["Date"];
    var wstt2017 = ["Date"];
    var wstt2018 = ["Date"];
    var wstt2019 = ["Date"];
    var wsnt = ["Date"];
    var wsnt2016 = ["Date"];
    var wsnt2017 = ["Date"];
    var wsnt2018 = ["Date"];
    var wsnt2019 = ["Date"];
    var algae = ["Algae"];
    var algae2016 = ["2016"];
    var algae2017 = ["2017"];
    var algae2018 = ["2018"];
    var algae2019 = ["2019"];
    var toxin = ["Toxins"];
    var toxin2016 = ["2016"];
    var toxin2017 = ["2017"];
    var toxin2018 = ["2018"];
    var toxin2019 = ["2019"];
    var nitrate = ["Total Nitrate"];
    var nitrate2016 = ["2016"];
    var nitrate2017 = ["2017"];
    var nitrate2018 = ["2018"];
    var nitrate2019 = ["2019"];
    // var negTests = ["Negative Tests"];
    var sampleSiteSelect = {
      name: "Log_Boom",
      a: algae,
      a2016: algae2016,
      a2017: algae2017,
      a2018: algae2018,
      a2019: algae2019,
      t: toxin,
      t2016: toxin2016,
      t2017: toxin2017,
      t2018: toxin2018,
      t2019: toxin2019,
      n: nitrate,
      n2016: nitrate2016,
      n2017: nitrate2017,
      n2018: nitrate2018,
      n2019: nitrate2019,
    }

    sampleSiteCounts(sampleSiteSelect);

    sampleSubChart.load({
      unload: true,
      columns: [sampleSiteSelect.a2019, sampleSiteSelect.a2018, sampleSiteSelect.a2017],
    });
    sampleChart.load({
      unload: true,
      columns: [sampleSiteSelect.a2019, sampleSiteSelect.a2018, sampleSiteSelect.a2017],
    });
    toxinChart.load({
      unload: true,
      columns: [sampleSiteSelect.t2019, sampleSiteSelect.t2018, sampleSiteSelect.t2017],
    });
    nitrateChart.load({
      unload: true,
      columns: [sampleSiteSelect.n2019, sampleSiteSelect.n2018, sampleSiteSelect.n2017],
    });
    $("#sample2016").css('color', 'white');
  });
  $("#Heater").on("click", function() {
    $("#sampleDropdown").text("Heater");

    var wst = ["Date"];
    var wst2016 = ["Date"];
    var wst2017 = ["Date"];
    var wst2018 = ["Date"];
    var wst2019 = ["Date"];
    var wstt = ["Date"];
    var wstt2016 = ["Date"];
    var wstt2017 = ["Date"];
    var wstt2018 = ["Date"];
    var wstt2019 = ["Date"];
    var wsnt = ["Date"];
    var wsnt2016 = ["Date"];
    var wsnt2017 = ["Date"];
    var wsnt2018 = ["Date"];
    var wsnt2019 = ["Date"];
    var algae = ["Algae"];
    var algae2016 = ["2016"];
    var algae2017 = ["2017"];
    var algae2018 = ["2018"];
    var algae2019 = ["2019"];
    var toxin = ["Toxins"];
    var toxin2016 = ["2016"];
    var toxin2017 = ["2017"];
    var toxin2018 = ["2018"];
    var toxin2019 = ["2019"];
    var nitrate = ["Total Nitrate"];
    var nitrate2016 = ["2016"];
    var nitrate2017 = ["2017"];
    var nitrate2018 = ["2018"];
    var nitrate2019 = ["2019"];
    // var negTests = ["Negative Tests"];
    var sampleSiteSelect = {
      name: "Heater",
      a: algae,
      a2016: algae2016,
      a2017: algae2017,
      a2018: algae2018,
      a2019: algae2019,
      t: toxin,
      t2016: toxin2016,
      t2017: toxin2017,
      t2018: toxin2018,
      t2019: toxin2019,
      n: nitrate,
      n2016: nitrate2016,
      n2017: nitrate2017,
      n2018: nitrate2018,
      n2019: nitrate2019,
    }

    sampleSiteCounts(sampleSiteSelect);


    sampleSubChart.load({
      unload: true,
      columns: [sampleSiteSelect.a2019, sampleSiteSelect.a2018, sampleSiteSelect.a2017],
    });
    sampleChart.load({
      unload: true,
      columns: [sampleSiteSelect.a2019, sampleSiteSelect.a2018, sampleSiteSelect.a2017],
    });
    toxinChart.load({
      unload: true,
      columns: [sampleSiteSelect.t2019, sampleSiteSelect.t2018, sampleSiteSelect.t2017],
    });
    nitrateChart.load({
      unload: true,
      columns: [sampleSiteSelect.n2019, sampleSiteSelect.n2018, sampleSiteSelect.n2017],
    });

    $("#sample2016").css('color', 'white');
  });
  $("#Blowout").on("click", function() {
    $("#sampleDropdown").text("Blowout");

    var wst = ["Date"];
    var wst2016 = ["Date"];
    var wst2017 = ["Date"];
    var wst2018 = ["Date"];
    var wst2019 = ["Date"];
    var wstt = ["Date"];
    var wstt2016 = ["Date"];
    var wstt2017 = ["Date"];
    var wstt2018 = ["Date"];
    var wstt2019 = ["Date"];
    var wsnt = ["Date"];
    var wsnt2016 = ["Date"];
    var wsnt2017 = ["Date"];
    var wsnt2018 = ["Date"];
    var wsnt2019 = ["Date"];
    var algae = ["Algae"];
    var algae2016 = ["2016"];
    var algae2017 = ["2017"];
    var algae2018 = ["2018"];
    var algae2019 = ["2019"];
    var toxin = ["Toxins"];
    var toxin2016 = ["2016"];
    var toxin2017 = ["2017"];
    var toxin2018 = ["2018"];
    var toxin2019 = ["2019"];
    var nitrate = ["Total Nitrate"];
    var nitrate2016 = ["2016"];
    var nitrate2017 = ["2017"];
    var nitrate2018 = ["2018"];
    var nitrate2019 = ["2019"];
    // var negTests = ["Negative Tests"];
    var sampleSiteSelect = {
      name: "Blowout",
      a: algae,
      a2016: algae2016,
      a2017: algae2017,
      a2018: algae2018,
      a2019: algae2019,
      t: toxin,
      t2016: toxin2016,
      t2017: toxin2017,
      t2018: toxin2018,
      t2019: toxin2019,
      n: nitrate,
      n2016: nitrate2016,
      n2017: nitrate2017,
      n2018: nitrate2018,
      n2019: nitrate2019,
    }

    sampleSiteCounts(sampleSiteSelect);


    sampleSubChart.load({
      unload: true,
      columns: [sampleSiteSelect.a2019, sampleSiteSelect.a2018, sampleSiteSelect.a2017],
    });
    sampleChart.load({
      unload: true,
      columns: [sampleSiteSelect.a2019, sampleSiteSelect.a2018, sampleSiteSelect.a2017],
    });
    toxinChart.load({
      unload: true,
      columns: [sampleSiteSelect.t2019, sampleSiteSelect.t2018, sampleSiteSelect.t2017],
    });
    nitrateChart.load({
      unload: true,
      columns: [sampleSiteSelect.n2019, sampleSiteSelect.n2018, sampleSiteSelect.n2017],
    });
    $("#sample2016").css('color', 'white');
  });

  $("#CHARadio").on("click", function() {
    $("#CyANDatePicker").hide();
    $("#CHLANDatePicker").show();
  });
  $("#CYANRadio").on("click", function() {
    $("#CyANDatePicker").show();
    $("#CHLANDatePicker").hide();
  });
    precipSubChart.zoom([1328630400000,1351267200000]);
    precipSumSubChart.zoom([1328630400000,1351267200000]);
    chart.zoom([1583078400000,1603724400000]);
    sampleSubChart.zoom([1463537040000,1473214680000]);
});

// Tab JS
var triggerTabList = [].slice.call(document.querySelectorAll('#gage-instant-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()
  })
})
var triggerTabList = [].slice.call(document.querySelectorAll('#gage-sum-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()
  })
})
// Tab JS
var triggerTabList = [].slice.call(document.querySelectorAll('#context-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()
  })
})
var triggerTabList = [].slice.call(document.querySelectorAll('#content-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()
  })
})
var triggerTabList = [].slice.call(document.querySelectorAll('#is-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()
  })
})

// Tab JS
var triggerTabList = [].slice.call(document.querySelectorAll('#weather-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()

  })
})
var triggerTabList = [].slice.call(document.querySelectorAll('#stream-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()

  })
})
var triggerTabList = [].slice.call(document.querySelectorAll('#sample-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()

  })
})
var triggerTabList = [].slice.call(document.querySelectorAll('#cyan-tab'))
triggerTabList.forEach(function(triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function(event) {
    event.preventDefault()
    tabTrigger.show()

  })
})


// tooltips on hover on integer in donut Charts



// Open sidebar
function openNav() {
  $("#info").show();
  $("#openBar").hide();
  mymap.fitBounds(lakeBoundsClosedMini);
}

// Close Sidebar
function closeNav() {
  $("#info").hide();
  $("#openBar").show();
  mymap.fitBounds(lakeBoundsClosed);
}

// Satellite tab interactions
$("#sat-tab").on("click", function() {
  $("#infoMapLegend").hide();
  $("#sat-button").show();
});
$("#sat-button").on("click", function() {
  $("#infoMapLegend").show();
  $("#sat-button").hide();
});
$("#sat-button").hide();
$("#openBar").hide();
$("#CyANDatePicker").hide();



// Todays Date
var today = new Date();
// Forat Todays Date
var date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
// Update LAst update text with todays date
$("#date").text("Last update: " + date);


///////////////////////// Attribution at bottom ledt of map
$(".leaflet-control-attribution")
  .css("background-color", "transparent")
  .css("color", "white")
  .html("Supported by <a href='https://www.clrwater.io/' target='_blank' style='color:white;''> ClearWater Analytica </a>");
