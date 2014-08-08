$(document).ready( function() {
  // Defining name space
  // var app = app || {};
  
  heatmapView = new app.HeatmapView({
    el: $("#app-container")
  });
  console.log("Instance created in: " + heatmapView.el.nodeName +" with the name "+ heatmapView.el.id);
});

//$(function() {
  // This didn't work. Why?
//});