const SENSOR_HEIGHT = 18; // In centimeters

const COLOR_NORMAL = "#388e3c";
const COLOR_WARNING = "#ef6c00";
const COLOR_DANGER = "#d32f2f";
const COLOR_ERROR = "#1565c0";

const WARNING_NORMAL = "NORMAL";
const WARNING_WARNING = "WARNING";
const WARNING_DANGER = "DANGER";
const WARNING_ERROR = "ERROR";

const WARNING_INFO_NORMAL = "Please keep calm and be vigilant.";
const WARNING_INFO_WARNING = "Please prepare to evacuate.";
const WARNING_INFO_DANGER = "Please evacuate immediately!";
const WARNING_INFO_ERROR = "The water levels displayed may be incorrect.";
const WARNING_INFO_OUTDATED = "The last recorded water levels are displayed.";

var receivedDistance = SENSOR_HEIGHT;
var distance = SENSOR_HEIGHT;
var updated = false;
var chartColor = COLOR_NORMAL;
var chart = null;

var mock = false;

window.onload = function() {
  Pusher.logToConsole = mock;
  
  var pusher = new Pusher('acd7c7e6fa6ab1b860d1', {
      cluster: 'ap1',
      encrypted: true
  });
  
  var channel = pusher.subscribe('distance');
  channel.bind('flood-reading', function(data) {
      receivedDistance = parseFloat(data.message) // Check this line if there are errors. Change data.message -> data["message"]
      updated = true;
  });

  initializeGraph();
  
  setInterval(function () {
    var warning = "";
    var warningInfo = "";
    var waterLevel = 0;
    var lastDistance = distance;
  
    if (mock) {
      var update = getRandomUpdate(0.1, 5, 0.5);
    
      distance = distance + update;
      
      updated = true;
    } else
      distance = receivedDistance;
  
    if (!updated) {
      distance = lastDistance;
      warningLevel = -1;
    } else {
      waterLevel = SENSOR_HEIGHT - distance;
      
      if (waterLevel >= 0 && waterLevel < 6)
        warningLevel = 0;
      else if (waterLevel >= 6 && waterLevel < 12)
        warningLevel = 1;
      else if (waterLevel >= 12)
        warningLevel = 2;
      else
        warningLevel = -1;
    }
  
    document.getElementById("warning").classList = "large";
    
    switch (warningLevel) {
      case 0:
        chartColor = COLOR_NORMAL;
        warning = WARNING_NORMAL;
        warningInfo = WARNING_INFO_NORMAL;
  
        document.getElementById("warning").classList.add("warning-normal");
        break;
      case 1:
        chartColor = COLOR_WARNING;
        warning = WARNING_WARNING;
        warningInfo = WARNING_INFO_WARNING;
  
        document.getElementById("warning").classList.add("warning-warning");
        break;
      case 2:
        chartColor = COLOR_DANGER;
        warning = WARNING_DANGER;
        warningInfo = WARNING_INFO_DANGER;
  
        document.getElementById("warning").classList.add("warning-danger");
        break;
      case -1:
        chartColor = COLOR_ERROR;
        warning = WARNING_ERROR;
        warningInfo = WARNING_INFO_ERROR;
  
        document.getElementById("warning").classList.add("warning-error");
        break;
    }
    
    if (!updated)
      warningInfo = WARNING_INFO_OUTDATED;

    document.getElementById("water-level").textContent = Math.round(waterLevel) + " cm";
    document.getElementById("warning").textContent = warning;
    document.getElementById("warning-info").textContent = warningInfo;
  
    if (updated)
      addNewData(chart, waterLevel);
    
    chart.series[0].color = chartColor;
    chart.render();

    updated = false;

  }, 1000);
}

function initializeGraph() {
  chart = new Rickshaw.Graph({
    element: document.querySelector("#chart"),
    width: "600",
    height: "300",
    renderer: "line",
    max: SENSOR_HEIGHT,
    series: [{
      data: [],
      color: chartColor
    }]
  });
  chart.render();

  var xAxis = new Rickshaw.Graph.Axis.X({
    graph: chart,
    tickFormat: function(x) {
      var currDate = new Date(x * 1000);
      return currDate.getHours() + ":" + currDate.getMinutes() + ":" + currDate.getSeconds();
    }
  });
  xAxis.render();

  var yAxis = new Rickshaw.Graph.Axis.Y({
    graph: chart,
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT
  });
  yAxis.render();
}

function getRandomUpdate(weight, spikeMultiplier, spikeChance) {
  if (Math.random(1.0) >= spikeChance)
    weight = weight * spikeMultiplier;
  
  var update = (Math.random() * weight) * (Math.floor(Math.random() * 3) - 1);
  
  if ((distance >= SENSOR_HEIGHT && update > 0) || (distance <= 0 && update < 0))
    update *= -1;
    
  if (distance + update < 0)
    update *= -1;
  
  return update;
}

function addNewData(chart, value) {
		var currDate = new Date();
		var data = {
    		x: currDate.getTime() / 1000,
    		y: value,
    }
    
    var seriesData = chart.series[0].data;
    
    if (seriesData.length >= 60)
    	seriesData.shift();
      
    seriesData.push(data);
    
    chart.update();
}