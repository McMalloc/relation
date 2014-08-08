$(document).ready( function() {

  var heatmapView = new app.HeatmapView({
    el: $("#app-container")
  });
  console.log("Instance created in: " + heatmapView.el);
});

//$(function() {
  // This didn't work. Why?
//});