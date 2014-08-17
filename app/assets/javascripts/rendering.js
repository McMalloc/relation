var app = app || {};

var startX = 0;
var startY = 0;
var gridSize = 48;
var gridX = 0;
var gridY = 0;
var tilePadding = 1;
var categories = 9;
var colors = "YlGnBu";
var divergingColors = "PiYG";
app.svgcanvas = null;
app.renderScale = null;
app.renderModel = {};
app.heatmap;

function initCanvas(width, height, container) {
  app.svgcanvas = d3.select(container) //"#app-container"
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

function replaceSet(modelIdx, vert, hor, parameter) {
  var set = app.prototypes.get(modelIdx).get("passes");
  var scale = buildQuantitiveScale(modelIdx, parameter);
  app.heatmap.data(set)
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * (d[hor] - 1)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] - 1)) + tilePadding;
    })
    .transition()
    .style("fill", function (d) {
      return d3.rgb(scale(d[parameter])); //d.data*255, d.data*255, d.data*255); 
    })
    .attr("title", function (d, i) {
      return d[parameter];
    });
}

function buildFetchString(fH) {
  var str = 'fetch/pass?project_id='+ fH.project_id +'&prototype_id='+ fH.prototype_id + '&task_id='+ fH.task_id +'&participant_id='+ fH.participant_id;
  console.log("Request JSON: " + str);
  return str;
}

function buildDiffMap(model1Idx, model2Idx) {
  var set1 = app.prototypes.get(model1Idx).get("passes");
  var set2 = app.prototypes.get(model2Idx).get("passes");
  var diffset = [];
  
  if (set1.length == set2.length) {
    _.map(set1, function(e, i) {
      diffset[i] = {};
      diffset[i]["tasktime"] = set1[i]["tasktime"] - set2[i]["tasktime"];
      diffset[i]["satisfaction"] = set1[i]["satisfaction"] - set2[i]["satisfaction"];
      diffset[i]["completed"] = set1[i]["completed"] - set2[i]["completed"];
      diffset[i]["markercount"] = set1[i]["markercount"] - set2[i]["markercount"];
      diffset[i]["task_id"] = set1[i]["task_id"];
      diffset[i]["participant_id"] = set1[i]["participant_id"];
      diffset[i]["id"] = set1[i]["id"];
    });
  } else {
    _.map(set1, function(e, i) {
      diffset[i][parameter] = set1[i][parameter];
    });
  };
  return diffset;
}

function changeParameter(parameter) {
  var scale = buildQuantitiveScale(app.renderModel, parameter);
  app.heatmap.transition().style("fill", function (d) {
    return d3.rgb(scale(d[parameter]));
  });
}

function renderDiffMap(set, vert, hor, parameter) { // redundant
  var scale = buildDiffScale(set, parameter);
  app.heatmap.data(set)
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * (d[hor] - 1)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] - 1)) + tilePadding;
    })
    .transition()
    .style("fill", function (d) {
      return d3.rgb(scale(d[parameter]));
    })
    .attr("title", function (d, i) {
      return d[parameter];
    });
}

function buildDiffScale(set, parameter) {
  var max = _.max(set, function(pass) {
    return pass[parameter];
  });
  var min = _.min(set, function(pass) {
    return pass[parameter];
  });
  var maxRange = Math.max(Math.abs(min[parameter]), Math.abs(max[parameter]));
  var mapper = d3.scale.quantize()
    .range(d3.range(0, categories - 1))
    .domain([maxRange*(-1), maxRange]);
  var scl = function (domainValue) {
    var palette = colorbrewer[divergingColors][categories];
    return palette[mapper(domainValue)];
  };
  return scl;
}

function buildQuantitiveScale(modelIdx, parameter) {
  var array = app.prototypes.get(modelIdx).get("passes");
  var min = 0;
  var max = 0;
  var mapper = d3.scale.quantize()
    .domain([Math.max.apply(Math, array.map(function (pass) {
      return pass[parameter];
    })), Math.min.apply(Math, array.map(function (pass) {
      return pass[parameter];
    }))]) // Min and Max of objects sum attribute in the array. TODO: make it readable by humans, goddammit
    .range(d3.range(0, categories - 1)); // seven color categories
  var scl = function (domainValue) {
    if (domainValue) {
      var palette = colorbrewer[colors][categories];
      return palette[mapper(domainValue)]; // closure TODO: really needed?
    } else {
      return {range: mapper.range(), domain: mapper.domain()};
    };
  };
  app.renderScale = scl;
  return scl;
}

function renderLegend(scale, nVert, nHor) {
  var linearScl = d3.scale.linear()
    .domain(scale().domain)
    .range([scale().range[0], scale().range[scale().range.length - 1]]);
  app.legend = app.svgcanvas.selectAll("rect").data(scale().range).enter().append("rect")
    .attr("width", function() { return app.heatmap.attr("height")/2; })
    .attr("height", function() { return (app.heatmap.attr("height")*nHor)/_.max(scale().range); })
    .attr("x", function() { return startX + (app.heatmap.attr("width")*nHor+45); } ) //TODO: replace magic number
    .attr("y", function(d) {
      return startY + 
    } )
  return linearScl;
}

function showDetail(idx, visible) {
  if (visible) {
    labels[0][idx].style.visibility = "visible";
  } else {
    labels[0][idx].style.visibility = "hidden";
  };
};
function expandRect(rect) {
  var factor = 5;
  var offset = factor + parseInt(tilePadding/2);
  console.log(offset);
  var selection = d3.select(rect).transition().duration(125);
  
  rect.parentNode.appendChild(rect); // move to the top!
  selection
    .attr("width", gridSize + (factor*2))
    .attr("height", gridSize + (factor*2))
    .attr("x", function() { 
      return parseInt(d3.select(rect).attr("x")) - offset; 
    })
    .attr("y", function() { 
      return parseInt(d3.select(rect).attr("y")) - offset; 
    });

}
function collapseRect(rect) {
  var factor = 10;
  var offset = factor + parseInt(tilePadding/2);
  var selection = d3.select(rect).transition().duration(125);
  console.log(offset);
  selection
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("x", function() { 
      return parseInt(d3.select(rect).attr("x")) + offset; 
    })
    .attr("y", function() { 
      return parseInt(d3.select(rect).attr("y")) + offset; 
    });
  
}

function renderHeatmap(modelIdx, vert, hor, parameter) {
  app.renderModel = modelIdx;
  var set = app.prototypes.get(modelIdx).get("passes");
  var scale = buildQuantitiveScale(modelIdx, parameter);
  var nHor = _.max(set, function(pass) {
    return pass[hor];
  })[hor];
  var nVert = _.max(set, function(pass) {
    return pass[vert];
  })[vert];
  var cWidth = $("#app-container").width();
  gridSize = Math.floor(cWidth/(nHor+1));
  
  app.heatmap = app.svgcanvas.selectAll("rect").data(set).enter().append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * (d[hor] - 0)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] - 0)) + tilePadding;
    })
    .style("fill", function (d) {
      return d3.rgb(scale(d[parameter])); //d.data*255, d.data*255, d.data*255); 
    })
    .attr("title", function (d, i) {
      return d[parameter];
    })
    .on("mouseenter", function (d, i) {
      //expandRect(this);
      //showDetail(i, true);
    })
    .on("mouseout", function (d, i) {
      //showDetail(i, false);
      //collapseRect(this);
    });
//  labels.append("tspan") // inherit from <text> element

};

function buildXaxis(hor) {
  var participantsModels = app.participants.get(modelIdx).get("passes");
  
  return array;
}

function buildYaxis(vert) {
  var set = app.prototypes.get(modelIdx).get("passes");
  return array;
}
