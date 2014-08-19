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
      return startX + (gridSize * (d[hor] + 0)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] + 1)) + tilePadding;
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

function buildQuantitiveScale(modelIdx, parameter) {
  var array = app.prototypes.get(modelIdx).get("passes");
  var min = 0;
  var max = 0;
  var mapper = d3.scale.quantize()
    .domain([Math.max.apply(Math, array.map(function (pass) {
      return pass[parameter];
    })), Math.min.apply(Math, array.map(function (pass) {
      return pass[parameter];
    }))]) // Min and Max of objects sum attribute in the array. TODO: make it readable by humans
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

function renderLegend(height, scale, offset) {
  // TODO
  var linearScl = d3.scale.linear()
    .domain(scale().domain)
    .range([scale().range[0], scale().range[scale().range.length - 1]]);
  var barHeight = height/_.max(scale().range);
  var palette = colorbrewer[colors][categories];
  var dataset = scale().range;
  
  app.legend = app.svgcanvas.selectAll("rect").data(dataset).enter().append("rect")
    .attr("width", function() { 
      return 35; 
    })
    .attr("height", function() { return barHeight; })
    .attr("x", function() { 
      return startX + offset; 
    } )
    .attr("y", function(d, i) {
      console.log(i);
      return startY + (i*barHeight);
    })
    .style("fill", function (d,i) {
      return d3.rgb(palette[d]);
    });
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
  var cWidth = $("#app-container").width() - 70;
  gridSize = Math.floor(cWidth/(nHor+1));

  //renderLegend((gridSize - tilePadding)*nHor, scale, (gridSize - tilePadding)*nHor+45);
  
  app.heatmap = app.svgcanvas.selectAll("rect").data(set).enter().append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * (d[hor] + 0)) + tilePadding*3;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] + 1)) + tilePadding;
    })
    .style("fill", function (d) {
      return d3.rgb(scale(d[parameter])); //d.data*255, d.data*255, d.data*255); 
    });
  
//  labels.append("tspan") // inherit from <text> element
  
  var xArr = _.zip(app.participants.pluck("name"), app.participants.pluck("persona_desc"));
  var yArr = app.tasks.pluck("name");
  var textHeight = null;
  
  app.horAxesA = app.svgcanvas.selectAll("text .participants").data(xArr).enter().append("text")
    .text(function(d) { return d[0]; })
    .attr("class", "heatmap-label")
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
    .attr("class", "heatmap-label")
    .attr("class", "persona-label")
    .text(function(d) { return "  " + d[1]; });

  app.vertAxes = app.svgcanvas.append("g").selectAll("text .tasks").data(yArr).enter().append("text")
    .attr("y", function (d, i) {
      return startX + ((gridSize) * (i)) - gridSize*0.5;// + textHeight;
    })
    .attr("x", function() { return tilePadding;})
    .attr("class", "heatmap-label")
    .text(function(d) { return d; })
    .call(wrap, gridSize, textHeight);
  
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
