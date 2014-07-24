//# Place all the behaviors and hooks related to the matching controller here.
//# All this logic will automatically be available in application.js.
//# You can use CoffeeScript in this file: http://coffeescript.org/

var width = 1200;
var height = 900;
var startX = 10;
var startY = 10;
var gridSize = 96;
var gridX = 0;
var gridY = 0;
var tilePadding = 3;
var categories = 8;
var permanent_json;
// TODO: use d3.map instead of objects the whole time https://github.com/mbostock/d3/wiki/Arrays#maps

jQuery(function(){
  $('#vis_tasktime').button();
  $('#vis_sum').button();
  $('#vis_satisfaction').button();

  $('#vis_sum').on('click', function(e) {
    changeVis("sum");
  });  
  $('#vis_tasktime').on('click', function(e) {
    changeVis("tasktime");
  }); 
  $('#vis_satisfaction').on('click', function(e) {
    changeVis("satisfaction");
  }); 
});

function changeVis(parameter) {
  var scale = buildQuantitiveScale(permanent_json, parameter)
  heatmap.transition().style("fill", function(d) { 
					return d3.rgb(scale(d[parameter]));//d.data*255, d.data*255, d.data*255); 
				})
}

function fetchAndRender(getRequest) {
  d3.json(getRequest, function(error, json) {
      permanent_json = json;
      var scale = buildQuantitiveScale(json, "tasktime");
      svgcanvas = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
      renderHeatmap(json, scale);
  });
}

function buildQuantitiveScale(array, parameter) {
    console.dir(parameter);
	var mapper = d3.scale.quantize()
					.domain([Math.max.apply(Math, array.map(function(pass){return pass[parameter];})), Math.min.apply(Math, array.map(function(pass){return pass[parameter];}))]) // Min and Max of objects' sum attribute in the array. TODO: not safe against non quantitive data
					.range(d3.range(0, categories-1)); // seven color categories
	var scl = function (domainValue) {
		var palette = colorbrewer.YlGnBu[categories]; // TODO: make flexible
		return palette[mapper(domainValue)]; // closure TODO: really needed?
	};
	return scl;
}

function showDetail(idx, visible) {
	if (visible) {
		labels[0][idx].style.visibility = "visible";
	} else {
		labels[0][idx].style.visibility = "hidden";
	};
};

function renderHeatmap(set, scale) {

	heatmap = svgcanvas.selectAll("rect").data(set).enter().append("rect")
					.attr("width", gridSize - tilePadding)
					.attr("height", gridSize - tilePadding)
					.attr("rx", 3)
					.attr("ry", 3)
					.attr("x", function(d) {
							return startX + (gridSize * d.participant_id) + tilePadding; 
						})
					.attr("y", function(d) { 
							return startY + (gridSize * d.task_id) + tilePadding; 
						})
					.style("fill", function(d) { 
							//console.log(d.data, scale(d.data));
							return d3.rgb(scale(d.tasktime));//d.data*255, d.data*255, d.data*255); 
						})
					.attr("title", function(d, i) { return  d.tasktime; })
					.on("mouseenter", function (d, i) { showDetail(i, true); })
					.on("mousein", function (d, i) { showDetail(i, true); })
					.on("mouseout", function (d, i) { showDetail(i, false); }); // TODO: shows not all details, only data values
    
	labels = svgcanvas.selectAll("text").data(set).enter().append("text")
					.attr("x", function(d) { 
							return startX + 4 + (gridSize * d.participant_id)  + tilePadding; 
						})
					.attr("y", function(d) { 
							return startY - 4 + gridSize + (gridSize * d.task_id)  + tilePadding;
						})
					.attr("class", "tile-label");
				labels.append("tspan")
					.attr("dy", "-1.8em")
					.text(function(d, i) { return (d.participant_id) + ", " + (d.task_id) + ": "; }) // TODO: make flexible 
					.attr("class", "tile-label small");
				labels.append("tspan") // inherit from <text> element
					.attr("dy", "1.2em")
					.text(function(d, i) { return d.tasktime; });// TODO: label is not exact anymore, .data will suffice			
};
fetchAndRender('fetch/1');