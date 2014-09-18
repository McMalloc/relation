var app = app || {};

var gridSize = 48;
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
app.palette = [];

function initCanvas(width, height, container) {
  app.svgcanvas = d3.select(container) //"#app-container"
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

function replaceSet() {
  app.renderSet = app.passes.where({prototype_id: heatmapView.setId});
  app.heatmaprects.data(app.renderSet)
    .transition()
    .style("fill", function (d) {
      return d3.rgb(app.renderScale(d.get(heatmapView.currentParameter)));
    })
    .attr("title", function (d, i) {
      return d.get(heatmapView.currentParameter);
    });
  app.heatmaplabels.data(app.renderSet)
    .text(function(d){ return d.get(heatmapView.currentParameter); });
}

function buildDiffMap(idA, idB) {
  var setA = _.map(app.passes.where({prototype_id: parseInt(idA)}), function (m) { return m.get(heatmapView.currentParameter); });
  var setB = _.map(app.passes.where({prototype_id: parseInt(idB)}), function (m) { return m.get(heatmapView.currentParameter); });
  heatmapView.diffset = (_.map(_.zip(setA, setB), function(a) { return a[1]-a[0] }));
}

function renderDiffMap() {
  app.heatmap.data(heatmapView.diffset);
  app.heatmaprects.data(heatmapView.diffset)
    .transition()
    .style("fill", function (d) {
      return d3.rgb(app.renderScale(d));
    })
    .attr("title", function (d, i) {
      return d;
    });
  app.heatmaplabels.data(heatmapView.diffset)
    .text(function(d){ return d; });
  updateLegend();
}

function changeParameter() {
  buildScale();
  if (!heatmapView.diffView) {
    app.heatmaprects.transition().style("fill", function (d) {
      return d3.rgb(app.renderScale(d.get(heatmapView.currentParameter))); // TODO: does not work for individual markers
    });
    app.heatmaplabels.text(function(d){ 
      return d.get(heatmapView.currentParameter); 
    });
  } else {
    buildDiffMap(1, 2);
    app.heatmaprects.data(heatmapView.diffset).transition().style("fill", function (d) {
      return d3.rgb(app.renderScale(d)); // TODO: does not work for individual markers
    });
    app.heatmaplabels.data(heatmapView.diffset).text(function(d){ 
      return d; 
    });    
  };
  updateLegend();
}

function buildScale() {
  if (heatmapView.diffView) {
    //var max = _.max(heatmapView.diffset);
    //var min = _.min(heatmapView.diffset);
    var max = Math.max(Math.abs(_.max(heatmapView.diffset)), Math.abs(_.min(heatmapView.diffset)));
    var min = max*(-1);
    app.palette = colorbrewer[divergingColors][categories];
  } else {
    var max = app.passes.max(function(m) {return m.get(heatmapView.currentParameter);}).get(heatmapView.currentParameter);
    var min = app.passes.min(function(m) {return m.get(heatmapView.currentParameter);}).get(heatmapView.currentParameter);
    app.palette = colorbrewer[colors][categories];
  }
  app.mapper = d3.scale.quantize()
    .range(d3.range(0, categories - 1))
    .domain([min, max]);
  app.renderScale = function (domainValue) {
    return app.palette[app.mapper(domainValue)];
  };
}

function updateLegend() {
  
  app.legendfields.data(app.palette)
    .style("fill", function (d,i) {
      return d3.rgb(d);
    });
  
  app.legendlabels.data(app.palette)
    .text( function(d, i) {
      return parseInt(app.mapper.invertExtent(i-1)[0]);
    });
}

function renderLegend(nVert, nHor, offset) {
  var barHeight = (nVert*gridSize)/app.palette.length;
  
  app.legend = app.svgcanvas.append("g").selectAll("g").data(app.palette).enter().append("g") 
    .attr("transform", function(d, i) {
      return "translate("+ ((nHor*gridSize) + gridSize + 30) +","+ ((gridSize*2) + tilePadding + (i*barHeight)) +")";
    });
  
  app.legendfields = app.legend.append("rect")
    .attr("width", function() { 
      return 35; 
    })
    .attr("height", function() { return barHeight; })
    .style("fill", function (d,i) {
      return d3.rgb(d);
    });
    
  app.legendlabels = app.legend.append("text")
    .attr("transform", "translate(40,15)")
    .text( function(d, i) {
      return parseInt(app.mapper.invertExtent(i-1)[0]);
    });
}

function renderHeatmap() {
  var vert = "task_id";
  var hor = "participant_id";
  app.renderSet = app.passes.where({prototype_id: heatmapView.setId});
  buildScale();
  var nHor = _.max(app.renderSet, function(pass) {
    return pass.get(hor);
  }).get(hor);
  var nVert = _.max(app.renderSet, function(pass) {
    return pass.get(vert);
  }).get(vert);
  var cWidth = $("#app-container").width() - 70;
  gridSize = Math.floor(cWidth/(nHor+1));

  app.heatmap = app.svgcanvas.selectAll("g").data(app.renderSet).enter().append("g")
    .attr("transform", function(d, i) {
      return "translate("+ ((gridSize * (d.get(hor) + 0)) + tilePadding*3) +","+ ((gridSize * (d.get(vert) + 1)) + tilePadding) +")"; })
    .attr("title", function(d) { return d.get(heatmapView.currentParameter); })
    .on("mouseenter", function(d, i) { d3.select("#Label-for-index-"+i).style("fill-opacity", "100%"); })
    .on("mouseleave", function(d, i) { d3.select("#Label-for-index-"+i).style("fill-opacity", "0%"); });
  
  app.heatmaprects = app.heatmap.append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .style("fill", function (d) {
      return d3.rgb(app.renderScale(d.get(heatmapView.currentParameter)));
    });
  
  app.heatmaplabels = app.heatmap.append("text")
    .text(function(d){ return d.get(heatmapView.currentParameter); })
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
      return textHeight + (gridSize * (i + 0)) + gridSize;
    })
    .attr("transform", function (d) {
      return "rotate(-45 "+ d3.select(this).attr("x") + " " + d3.select(this).attr("y") + ")"; 
    });
  
  app.horAxesB = app.svgcanvas.selectAll("text .personas").data(xArr).enter().append("text")
    .attr("y", function() { return (2*gridSize)-tilePadding;})
    .attr("x", function (d, i) {
      return textHeight + (gridSize * (i + 0)) + gridSize;
    })
    .attr("transform", function (d) {
      return "rotate(-45 "+ d3.select(this).attr("x") + " " + d3.select(this).attr("y") + ")";  
    })
    .attr("class", "axes-label")
    .attr("class", "persona-label")
    .text(function(d) { return "  " + d[1]; });

  app.vertAxes = app.svgcanvas.append("g").selectAll("text .tasks").data(yArr).enter().append("text")
    .attr("y", function (d, i) {
      return ((gridSize) * (i));// + textHeight;
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
