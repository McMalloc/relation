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
app.renderSet = {};
app.heatmap = {};
app.lastParameter = "";
app.mapper = {};

function isReversed(parameter) {
  return (parameter == "tasktime" || parameter == "satisfaction");
}

function initCanvas(width, height, container) {
  app.svgcanvas = d3.select(container) //"#app-container"
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

function replaceSet(modelIdx, vert, hor, parameter) {
  var set = app.passes.where({prototype_id: parseInt(modelIdx)});
  var scale = buildQuantitiveScale(parseInt(modelIdx), parameter);
  app.heatmap.data(set)
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * (d.get(hor) + 0)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d.get(vert) + 1)) + tilePadding;
    })
    .transition()
    .style("fill", function (d) {
      return d3.rgb(scale(d.get(parameter)));
    })
    .attr("title", function (d, i) {
      return d.get(parameter);
    });
}

function buildFetchString(fH) {
  var str = 'fetch/pass?project_id='+ fH.project_id +'&prototype_id='+ fH.prototype_id + '&task_id='+ fH.task_id +'&participant_id='+ fH.participant_id;
  console.log("Request JSON: " + str);
  return str;
}

function buildDiffMap(model1Idx, model2Idx) {
  var set1 = app.passes.where({prototype_id: parseInt(model1Idx)});
  var set2 = app.passes.where({prototype_id: parseInt(model2Idx)});
  var diffset = [];
  
  if (set1.length == set2.length) {
    _.map(set1, function(e, i) {
      diffset[i] = {};
      diffset[i]["tasktime"] = set1[i].get("tasktime") - set2[i].get("tasktime");
      diffset[i]["satisfaction"] = set1[i].get("satisfaction") - set2[i].get("satisfaction");
      diffset[i]["completed"] = set1[i].get("completed") - set2[i].get("completed");
      diffset[i]["markercount"] = set1[i].get("markercount") - set2[i].get("markercount");
      diffset[i]["task_id"] = set1[i].get("task_id");
      diffset[i]["participant_id"] = set1[i].get("participant_id");
      diffset[i]["id"] = set1[i].get("id");
    });
  } else {
    _.map(set1, function(e, i) {
      //diffset[i][parameter] = set1[i][parameter];
    });
  };
  return diffset;
}

function changeParameter(parameter) {
  if (app.lastParameter != parameter) {
    if (isReversed(parameter)) {
      app.renderScale = buildQuantitiveScale(app.renderSet, parameter, true);
    } else {
      app.renderScale = buildQuantitiveScale(app.renderSet, parameter, false);
    };
  }
  app.heatmaprects.transition().style("fill", function (d) {
    return d3.rgb(app.renderScale(d.get(parameter))); // TODO: does not work for individual markers
  });
  app.heatmaplabels.text(function(d){ 
    return d.get(parameter); 
  })
}

function renderDiffMap(set, vert, hor, parameter) { // redundant
  var scale = buildDiffScale(set, parameter);
  app.heatmap.data(set)
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * (d[hor] + 0)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] + 1)) + tilePadding;
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

function buildQuantitiveScale(set, parameter, inversed) {
  var array = set;
  var min = 0;
  var max = 0;
  var palette = colorbrewer[colors][categories];
  if (inversed) { palette.reverse() };
  
  var mapper = d3.scale.quantize()
    .domain([Math.max.apply(Math, set.map(function (pass) {
      return pass.get(parameter);
    })), Math.min.apply(Math, array.map(function (pass) {
      return pass.get(parameter);
    }))]) // Min and Max of objects sum attribute in the array. TODO: make it readable by humans
    .range(d3.range(0, categories - 1)); // seven color categories
  var scl = function (domainValue) {
    return palette[mapper(domainValue)]; // closure TODO: really needed?
  };
  app.renderScale = scl;
  app.mapper = mapper;
  app.lastParameter = parameter;
  return scl;
}

function renderLegend(nVert, nHor, offset) {
  var palette = colorbrewer[colors][categories];
  var barHeight = (nVert*gridSize)/palette.length;

  app.legend = app.svgcanvas.append("g").selectAll("g").data(palette).enter().append("g") 
    .attr("transform", function(d, i) {
      return "translate("+ ((nHor*gridSize) + gridSize + 30) +","+ ((gridSize*2) + tilePadding + (i*barHeight)) +")";
    });
  
  app.legend.append("rect")
    .attr("width", function() { 
      return 35; 
    })
    .attr("height", function() { return barHeight; })
    .style("fill", function (d,i) {
      return d3.rgb(d);
    });
    
  app.legend.append("text")
    .attr("transform", "translate(40,15)")
    .text( function(d, i) {
      console.log(d);
      return parseInt(app.mapper.invertExtent(i-1)[0]);
    });
}

function renderHeatmap(set, vert, hor, parameter) {
  app.renderSet = set;
  if (isReversed(parameter)) {
    app.renderScale = buildQuantitiveScale(set, parameter, true);
  } else {
    app.renderScale = buildQuantitiveScale(set, parameter, false);
  };
  var nHor = _.max(set, function(pass) {
    return pass.get(hor);
  }).get(hor);
  var nVert = _.max(set, function(pass) {
    return pass.get(vert);
  }).get(vert);
  var cWidth = $("#app-container").width() - 70;
  gridSize = Math.floor(cWidth/(nHor+1));

  app.heatmap = app.svgcanvas.selectAll("g").data(set).enter().append("g")
    .attr("transform", function(d, i) {
      return "translate("+ (startX + (gridSize * (d.get(hor) + 0)) + tilePadding*3) +","+ (startY + (gridSize * (d.get(vert) + 1)) + tilePadding) +")"; })
    .attr("title", function(d) { return d.get(parameter); })
    .on("mouseenter", function(d, i) { d3.select("#Label-for-index-"+i).style("fill-opacity", "100%"); })
    .on("mouseleave", function(d, i) { d3.select("#Label-for-index-"+i).style("fill-opacity", "0%"); });
  
  app.heatmaprects = app.heatmap.append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .style("fill", function (d) {
      return d3.rgb(app.renderScale(d.get(parameter))); //d.data*255, d.data*255, d.data*255); 
    });
  
  app.heatmaplabels = app.heatmap.append("text")
    .text(function(d){ return d.get(parameter); })
    .attr("transform", "translate(10, "+ (gridSize-10) +")")
    .attr("class", "heatmap-label")
    .attr("id", function(d, i) { return "Label-for-index-"+i; });
  
  var xArr = _.zip(app.participants.pluck("name"), app.participants.pluck("persona_desc"));
  var yArr = app.tasks.pluck("name");
  var textHeight = null;
  
  app.horAxesA = app.svgcanvas.selectAll("text .participants").data(xArr).enter().append("text")
    .text(function(d) { return d[0]; })
    .attr("class", "axes-label")
    .style("fill", function() { // dummy function to set textheight
      textHeight = this.getBBox().height;
    })
    .attr("y", function() { return (2*gridSize)-tilePadding-textHeight;})
    .attr("x", function (d, i) {
      return textHeight + startX + (gridSize * (i + 0)) + gridSize;
    })
    .attr("transform", function (d) {
      return "rotate(-45 "+ d3.select(this).attr("x") + " " + d3.select(this).attr("y") + ")"; 
    });
  
  app.horAxesB = app.svgcanvas.selectAll("text .personas").data(xArr).enter().append("text")
    .attr("y", function() { return (2*gridSize)-tilePadding;})
    .attr("x", function (d, i) {
      return textHeight + startX + (gridSize * (i + 0)) + gridSize;
    })
    .attr("transform", function (d) {
      return "rotate(-45 "+ d3.select(this).attr("x") + " " + d3.select(this).attr("y") + ")";  
    })
    .attr("class", "axes-label")
    .attr("class", "persona-label")
    .text(function(d) { return "  " + d[1]; });

  app.vertAxes = app.svgcanvas.append("g").selectAll("text .tasks").data(yArr).enter().append("text")
    .attr("y", function (d, i) {
      return startX + ((gridSize) * (i));// + textHeight;
    })
    .attr("x", function() { return tilePadding;})
    .attr("class", "axes-label")
    .text(function(d) { return d; })
    .call(wrap, gridSize, textHeight);
  
  renderLegend(nVert, nHor, 30);
  
  };

function wrap(text, width, height) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = height;
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
