//# Place all the behaviors and hooks related to the matching controller here.
//# All this logic will automatically be available in application.js.
//# You can use CoffeeScript in this file: http://coffeescript.org/

var width = 900;
var height = 900;
var startX = 10;
var startY = 10;
var gridSize = 96;
var gridX = 0;
var gridY = 0;
var tilePadding = 3;
var categories = 7;
// TODO: use d3.map instead of objects the whole time https://github.com/mbostock/d3/wiki/Arrays#maps

function renderView() {
  d3.json("data-markersPerTask.json", function(error, json) {
      var set = buildSet(json, "SUM");
      //var set = buildMarkerSet(json.tasks);
      //var markers = [];
      //var reference = json.allmarkers;
      //json.tasks.forEach(function(d,i) {
      //    markers.push(quantify(d.marker, reference));
      //});
      //updateDimension();
      var scale = buildQuantitiveScale(set.grid);
      //var colorScale = buildQualitativeScale(reference);
      //var lengthScale = buildSpatialScale(markers);
      renderHeatmap(set.tiles, scale);
      //renderMarkerChart(markers, colorScale, lengthScale, reference);
  });
}

/*function updateDimension() {
	gridSize = parseInt((width-startX) / gridX); //rubbish
	height = gridY * gridSize + startY;
};*/

function buildQuantitiveScale(grid) {
	var mapper = d3.scale.quantize()
					.domain([Math.min.apply(null, grid), Math.max.apply(null, grid)]) // TODO: not safe against non quantitive data
					.range(iterate(0, categories-1)); // seven color categories
	var scl = function (domainValue) {
		var palette = colorbrewer.YlGnBu[categories]; // TODO: make flexible
		return palette[mapper(domainValue)]; // closure TODO: really needed?
	};
	return scl;
}

function buildQualitativeScale(markers) {
	var mapper = d3.scale.ordinal()
					.domain(markers)
					.range(colorbrewer.Set2[markers.length]);
	return mapper;
}

function buildSpatialScale(markers) {
	var sums = [];
	markers.forEach(function(mrk_per_tsk, idx) {
		sums[idx] = 0;
		for (var mrk in mrk_per_tsk) {
			sums[idx] = sums[idx] + mrk_per_tsk[mrk];
		}
	});
	var max = Math.max.apply(null, sums);
	
	var mapper = d3.scale.linear()
					.domain([0, max])
					.range([0, width]);
	return mapper;
}

/*function quantify(array) {
	var quantities = [];
	array.sort();
	var first;
	var count = 1;	
	var idx = 0
	while (array.length > 0) {
		first = array.shift();
		if (first == array[0]) {
			quantities[idx] = count++;
		} else {
			quantities[idx] = count;
			count = 1;
			idx++;
		};
	};	
	return quantities;
};*/

function quantify(markers, ref) {
    markers.sort();
	var quantities = {};
    var current = null;
    var cnt = 0;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i] != current) {
            if (cnt > 0) {
				quantities[current] = cnt;
            }
            current = markers[i];
            cnt = 1;
        } else {
            cnt++;	
        }
    }
    if (cnt > 0) {
        quantities[current] = cnt;
    }
	ref.forEach(function(d, i) {
		if (!quantities.hasOwnProperty(d)) {
			quantities[d] = 0;
		};
	});
	return quantities;
};

function iterate(a, b) { // TODO: use d3.range() instead
	var arr = [];
	var idx = 0;	
	for (var i = a; i <= b; i++) {
		arr[idx] = i;
		idx++;
	};	
	return arr;
}

function Tile (x, y, data) {
	this.x = x;
	this.y = y;
	this.data = data;
	this.label = +data;
	this.setX = function() {};
};

function buildSet(json, property) { 
    var y = json.length; // number of tasks
    var x = json[1].runs.length; // number of participants
	gridX = x;
	gridY = y;
    var tiles = [];
	var grid = [];
	var index = 0;
	var view = {
		snippet:  "json[j-1].runs[i-1]." + property, 
		property: "json[0].runs[0].hasOwnProperty(\"" + property + "\")"
		}; // TODO: outsource to another file for flexibility, string concat for x and y axis

	if (eval(view.property)) {
		for (var j = 1; j<(y+1); j++) {
			for (var i = 1; i<(x+1); i++) {
				var current = eval(view.snippet);
				grid[index] = current;
				tiles[index] = new Tile (index%x, parseInt(index/x), current);
				index++;
			}
		}
	} else {
		alert("No such value!");
	};
	return {tiles:tiles, grid:grid};
};

function showDetail(idx, visible) {
	if (visible) {
		labels[0][idx].style.visibility = "visible";
	} else {
		labels[0][idx].style.visibility = "hidden";
	};
};

function buildMarkerSet(markers) {
	// TODO: outsource
};

function renderMarkerChart(set, colors, lengths, ref) {
	svgcanvas = d3.select("body")
					.append("svg")
					.attr("width", width)
					.attr("height", height);

	groups = svgcanvas.selectAll("g")
				.data(set)
				.enter().append("g")
					.attr("transform", function(d,i) {
							return "translate(" + 0 + "," + (i*gridSize) + ")";
						})
					.selectAll("rect")
					.data(function (d, i) {
						var ordered = [];
						var sum = 0;
						ref.forEach( function(mrk, i) {
							ordered[i] = {count: d[mrk], quantile: sum};
							sum = sum + d[mrk];
						} );
						return ordered;
					})
					.enter()
					.append("rect")
					.attr("height", gridSize-tilePadding)
					.attr("width", function(d) { return lengths(d.count); })
					.attr("x", function(d, i) { return lengths(d.quantile); })
					.attr("stroke", function(d, i){ 
						return d3.rgb(colors(i)).brighter(0.5);
					})
					.attr("stroke-width", 0)
					.style("fill", function(d, i) { return colors(i); })
					.attr("title", function(d, i) { return d.count; })
					.on("mouseenter", function() { 
						d3.select(this).attr("stroke-width", tilePadding);
					})
					.on("mousein", function() { 
						d3.select(this).attr("stroke-width", tilePadding);
					})
					.on("mouseout", function() { 
						d3.select(this).attr("stroke-width", 0);
					})
					.on("click", function(d, i, j) {
						rearrange(d, i, j, lengths);
						// console.dir(this);
						// console.log(d, i, j);
					});
};

function rearrange(current, ccol, crow, scale) {
	groups.transition().attr("transform", function(d, columns, rows) {
							var dx = scale(current.quantile - groups[rows][ccol].__data__.quantile);
							return "translate(" + dx + "," + 0 + ")";
						});
};

function renderHeatmap(set, scale) {
	svgcanvas = d3.select("body")
					.append("svg")
					.attr("width", width)
					.attr("height", height);

	heatmap = svgcanvas.selectAll("rect").data(set).enter().append("rect")
					.attr("width", gridSize - tilePadding)
					.attr("height", gridSize - tilePadding)
					.attr("rx", 3)
					.attr("ry", 3)
					.attr("x", function(d) {
							return startX + (gridSize * d.x) + tilePadding; 
						})
					.attr("y", function(d) { 
							return startY + (gridSize * d.y) + tilePadding; 
						})
					.style("fill", function(d) { 
							//console.log(d.data, scale(d.data));
							return d3.rgb(scale(d.data));//d.data*255, d.data*255, d.data*255); 
						})
					.attr("title", function(d, i) { return  d.data; })
					.on("mouseenter", function (d, i) { showDetail(i, true); })
					.on("mousein", function (d, i) { showDetail(i, true); })
					.on("mouseout", function (d, i) { showDetail(i, false); }); // TODO: shows not all details, only data values
					
	labels = svgcanvas.selectAll("text").data(set).enter().append("text")
					.attr("x", function(d) { 
							return startX + 4 + (gridSize * d.x)  + tilePadding; 
						})
					.attr("y", function(d) { 
							return startY - 4 + gridSize + (gridSize * d.y)  + tilePadding;
						})
					.attr("class", "tile-label");
				labels.append("tspan")
					.attr("dy", "-1.8em")
					.text(function(d, i) { return (d.x+1) + ", " + (d.y+1) + ": "; }) // TODO: make flexible 
					.attr("class", "tile-label small");
				labels.append("tspan") // inherit from <text> element
					.attr("dy", "1.2em")
					.text(function(d, i) { return d.label; });// TODO: label is not exact anymore, .data will suffice			
};