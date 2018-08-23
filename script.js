// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var tv = 1000;

var pusher = new Pusher('acd7c7e6fa6ab1b860d1', {
  cluster: 'ap1',
  encrypted: true
});

var updated = false;
var initial = 18;
var distance = initial;
var color = 'blue';
var warning = '';
//var currDate = new Date();

/* 
var channel = pusher.subscribe('distance');
channel.bind('flood-reading', function(data) {
  //alert(JSON.stringify(data));
    //addRandomData(chart);
    distance = parseFloat(data.message) // Check this line if there are errors. Change data.message -> data["message"]
    addNewData(chart, distance);
    
    if (distance >= 0 && distance < 50)
      color = 'red';
    else if (distance >= 50 && distance < 100)
      color = 'orange';
     else if (distance >= 100)
      color = 'green';
    else
      color = 'blue';
      
    chart.series[0]["color"] = color;
    
    console.log(chart);
    
    chart.render();
    
    updated = true;
});
 */

setInterval(function () {
  //addRandomData(chart);
  var weight = 0.1;
  
  if (Math.random(100) < 0.5)
  	weight = weight * 10;
  
  var update = (Math.random() * weight) * (Math.floor(Math.random() * 3) - 1);
  if ((distance >= initial && update > 0) || (distance <= 0 && update < 0))
  	update *= -1;
    
  if (distance + update < 0)
  	update *= -1;
  //console.log(update);
    
  distance += update;
  
  
  //console.log(chart);
  //distance += Math.random() * 1;
  
  //distance = 1 / distance;
  //console.log(distance);
  
  var floodLevel = initial - distance;
  
  
  document.getElementById("value").textContent = Math.round(floodLevel) + " cm";
  	
  //console.log((Math.random() * 10) * (Math.floor(Math.random() * 3) - 1));
  
  updated = true;
  /* 
  if (!updated)
    distance = 0.0;
   */
  addNewData(chart, floodLevel);
  
  if (floodLevel >= 0 && floodLevel < 6) {
    color = '#388e3c';
    warning = 'NORMAL';
    document.getElementById("warning").classList.remove("warning-danger");
    document.getElementById("warning").classList.remove("warning-warning");
    document.getElementById("warning").classList.add("warning-normal");
    
    document.getElementById("notice").textContent = "Please keep calm and be vigilant.";
    
  }
  else if (floodLevel >= 6 && floodLevel < 12) {
    color = '#ef6c00';
    warning = 'WARNING';
    document.getElementById("warning").classList.remove("warning-danger");
    document.getElementById("warning").classList.remove("warning-normal");
    document.getElementById("warning").classList.add("warning-warning");
    
    document.getElementById("notice").textContent = "Please prepare to evacuate.";
  }
  else if (floodLevel >= 12) {
    color = '#d32f2f';
    warning = 'DANGER';
    document.getElementById("warning").classList.remove("warning-warning");
    document.getElementById("warning").classList.remove("warning-normal");
    document.getElementById("warning").classList.add("warning-danger");
    
    document.getElementById("notice").textContent = "Please evacuate immediately!";
  }
  else {
    color = '#1565c0';
    warning = 'ERROR';
  }
  
  document.getElementById("warning").textContent = warning;

  chart.series[0]["color"] = color;

  updated = false;
  
  //chart = document.getElementsByClassName("app")[0].offsetWidth;

  chart.render();

}, tv);

// Chart


var chart = new Rickshaw.Graph({
    element: document.querySelector("#chart"),
    width: "600",
    height: "300",
    renderer: "line",
    max: initial,
    series: [{
    	data: [],
      color: color
    }]
});

var seriesData = chart.series[0].data;
/* 
for (var i = 0; i < 45; i++) {
  seriesData.push({x: -1, y: 0});
}
 */
chart.render();

var xAxis = new Rickshaw.Graph.Axis.X({
    graph: chart,
    tickFormat: function(x) {
    	var currDate = new Date(x * 1000);
      return currDate.getHours() + ":" + currDate.getMinutes() + ":" + currDate.getSeconds();
    }
     /* 
         timeUnit: function() {
      var time = new Rickshaw.Fixtures.Time.Local();
      time.formatTime = function(d) { 
        return moment(d).format("HH:mm:ss"); 
           }
      
      return time.unit("second");
         }
     */
});

xAxis.render();


var yAxis = new Rickshaw.Graph.Axis.Y({
    graph: chart,
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT
});

yAxis.render();



/* 
var xhttp = new XMLHttpRequest(); 
xhttp.onreadystatechange = function() {
    addNewData(chart, this.responseText);
    chart.render();
};
xhttp.open("GET", "ip of server", true);
xhttp.send();
 */
 
function addRandomData(chart) {
    var data = {
        one: Math.floor(Math.random() * 40) + 120
    };
    chart.series.addData(data);
}

function addNewData(chart, value) {
		var currDate = new Date();
		var data = {
    		x: currDate.getTime() / 1000,
    		y: value,
    }
    //chart.series.addData(data);
    
    var seriesData = chart.series[0].data;
    
    if (seriesData.length >= 45)
    	seriesData.shift();
      
    seriesData.push(data);
    
    chart.update();
     
    console.log(seriesData);
    
}