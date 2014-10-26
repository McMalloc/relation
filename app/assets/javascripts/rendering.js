var app = app || {};

var gridSize = 48;
var marginTop = 48;
var tilePadding = 1;
var categories = 9;
var colors = "YlGnBu";
var divergingColors = "PiYG";
var nVert = 0;
var nHor = 0;
app.svgcanvas = null;
app.renderScale = null;
app.renderSet = {};
app.heatmap = {};
app.lastParameter = "";
app.mapper = {};
app.palette = [];
app.activeMarkers = {};

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
      if (heatmapView.markerView) {
        return d3.rgb(app.renderScale(d.get("markercounts")[heatmapView.currentParameter]));
      } else {
        return d3.rgb(app.renderScale(d.get(heatmapView.currentParameter)));
      };
    })
    .attr("title", function (d, i) {
      if (heatmapView.markerView) {
        return d.get("markercounts")[heatmapView.currentParameter];
      } else {
        return d.get(heatmapView.currentParameter);
      };
    });
  app.heatmaplabels.data(app.renderSet)
    .text(function(d){ 
      if (heatmapView.markerView) {
        return d.get("markercounts")[heatmapView.currentParameter];
      } else {
        return d.get(heatmapView.currentParameter);
      };
    });
  updateLegend();
}

function buildSumSet(add) {
  var setS = heatmapView.sumset;
  var setA = [];
  setA = _.map(app.passes.where({prototype_id: heatmapView.setId}), function (m) { return m.get("markercounts")[heatmapView.currentParameter]; }); 
  heatmapView.sumset = (_.map(_.zip(setA, setS), function(a) { 
    if (add) {
      if( a[0] ) {return a[1]+1;} else {return a[1];}
    } else {
      if( a[0] ) {return a[1]-1;} else {return a[1];}
    };
  }));
}

function buildDiffMap(idA, idB) {
  var setA = [];
  var setB = [];
  if (heatmapView.markerView) {
      setA = _.map(app.passes.where({prototype_id: idA}), function (m) { return m.get("markercounts")[heatmapView.currentParameter]; });
      setB = _.map(app.passes.where({prototype_id: idB}), function (m) { return m.get("markercounts")[heatmapView.currentParameter]; }); 
  } else {
      setA = _.map(app.passes.where({prototype_id: idA}), function (m) { return m.get(heatmapView.currentParameter); });
      setB = _.map(app.passes.where({prototype_id: idB}), function (m) { return m.get(heatmapView.currentParameter); });
  };
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
  switch (heatmapView.viewMode) {
    case "emp":
      app.heatmaprects.transition().style("fill", function (d, i) {
        if (heatmapView.markerView) {
          var nActive = _.reduce(_.values(app.activeMarkers), function(memo, num){ return memo + num; }, 0) - 0;
          //return d3.rgb(app.renderScale(d.get("markercounts")[heatmapView.currentParameter]));
          if (heatmapView.sumset[i] == nActive) {
            return d3.rgb(app.renderScale(heatmapView.sumset[i]+1));
          } else {
            return d3.rgb("#eee");//app.renderScale(0));
          }
        } else {
          return d3.rgb(app.renderScale(d.get(heatmapView.currentParameter)));
        };
      });
      app.heatmaplabels.text(function(d, i){ 
        if (heatmapView.markerView) {
          //return d.get("markercounts")[heatmapView.currentParameter];
          return heatmapView.sumset[i];
        } else {
          return d.get(heatmapView.currentParameter);
        };
      });
      break;
    case "diff": // TODO now broken
      app.heatmaprects.data(heatmapView.diffset).transition().style("fill", function (d) {
        return d3.rgb(app.renderScale(d));
      });
      app.heatmaplabels.data(heatmapView.diffset).text(function(d){ 
        return d; 
      });
      break;
    case "stat":
      var set = _.pluck(app.statistics[heatmapView.setId], heatmapView.currentParameter);
      var cWidth = $("#app-container").width() - gridSize;
      var scaled = (heatmapView.currentParameter=="tasktime" || heatmapView.currentParameter=="satisfaction");
      if (scaled) {
        var scale = d3.scale.linear() // TODO: should be log...
          .domain([0, _.max(set, function(m){return m.mean}).mean + _.max(set, function(m){return m.interval}).interval])
          .range([0, cWidth]);
        app.testsc = scale;
      };
      
      app.boxchart.data(set)    
        .attr("width", function(d, i) {
          return 0;
        })   
        .attr("x", function(d, i) {
          if (scaled) {
            return gridSize+tilePadding + (scale(d.mean));
          } else {
            return gridSize+tilePadding + (cWidth*(d.mean));
          };
        })
        .transition().delay(1.5)
        .attr("x", function(d, i) {
          if (scaled) {
            return gridSize+tilePadding + (scale(d.mean)-scale(d.interval));
          } else {
            return gridSize+tilePadding + (cWidth*(d.mean-d.interval));
          };
        })
        .attr("width", function(d, i) {
          if (scaled) {
            return scale(d.interval*2);
          } else {
            return cWidth*(d.interval*2);
          };
        });
      
      app.boxchartlabels.data(set)
      .attr("x", function(d, i) {
          if (scaled) {
            return gridSize+tilePadding + (scale(d.mean)-scale(d.interval));
          } else {
            return gridSize+tilePadding + (cWidth*(d.mean-d.interval));
          };
      })
      .text(function(d, i) {
        console.log("switch to " + heatmapView.currentParameter);
        switch(heatmapView.currentParameter) {
          case "tasktime": return parseInt((d.mean-d.interval)) + "s ~ " + parseInt((d.mean+d.interval)) + "s"; break;
          case "satisfaction": return (d.mean-d.interval).toFixed(2) + " ~ " + (d.mean+d.interval).toFixed(2); break;
          default: return parseInt((d.mean-d.interval)*100) + "% ~ " + _.min([100, parseInt((d.mean+d.interval)*100)]) + "%"; break;
        };       
      });
      break;
  };
  updateLegend();
}

function buildScale() {
  var min = 0;
  var max = 1;
  switch (heatmapView.viewMode) {
    case "diff":
      max = Math.max(Math.abs(_.max(heatmapView.diffset)), Math.abs(_.min(heatmapView.diffset)));
      min = max*(-1);
      app.palette = colorbrewer[divergingColors][categories];
      break;
    case "emp":
      if (heatmapView.markerView) {
        //max = app.passes.max(function(m) {return m.get("markercounts")[heatmapView.currentParameter];}).get("markercounts")[heatmapView.currentParameter];
        max = app.passes.max(function(m) {return m.get("markercounts")["all"];}).get("markercounts")["all"];
        //min = app.passes.min(function(m) {return m.get("markercounts")[heatmapView.currentParameter];}).get("markercounts")[heatmapView.currentParameter];
        min = app.passes.min(function(m) {return m.get("markercounts")["all"];}).get("markercounts")["all"] - 2;
      } else {
        max = app.passes.max(function(m) {return m.get(heatmapView.currentParameter);}).get(heatmapView.currentParameter);
        min = app.passes.min(function(m) {return m.get(heatmapView.currentParameter);}).get(heatmapView.currentParameter);
      };
      if (heatmapView.currentParameter == "satisfaction") {
        var palette = _.compact(colorbrewer[colors][categories]);
        app.palette = palette.reverse();
      } else {
        app.palette = colorbrewer[colors][categories];
      };
      break;
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

function renderLegend(offset) {
  var barHeight = (nVert*gridSize)/Math.min(app.palette.length, app.mapper.domain()[1]); // TODO incomplete
  
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
      return parseInt(app.mapper.invertExtent(i));
    });
}

function renderHeatmap() {
  var vert = "task_id";
  var hor = "participant_id";
  app.renderSet = app.passes.where({prototype_id: heatmapView.setId});
  buildScale();
  nHor = _.max(app.renderSet, function(pass) {
    return pass.get(hor);
  }).get(hor);
  nVert = _.max(app.renderSet, function(pass) {
    return pass.get(vert);
  }).get(vert);
  var cWidth = $("#app-container").width() - 70;
  gridSize = Math.floor(cWidth/(nHor+1));
  
  //this won't work when the task_id doesn't start with 1
  app.heatmap = app.svgcanvas.selectAll("g").data(app.renderSet).enter().append("g")
    .attr("transform", function(d, i) {
      return "translate("+ ((gridSize * (d.get(hor) + 0)) + tilePadding*3) +","+ ((gridSize * (d.get(vert) + 1)) + tilePadding) +")"; })
    .attr("title", function(d) { return d.get(heatmapView.currentParameter); })
    .on("mouseenter", function(d, i) { 
      d3.select("#Label-for-index-"+i).style("fill-opacity", "100%"); 
      d3.select("#bg-for-index-"+i).style("fill-opacity", "70%");
    
      d3.select("#participant-"+d.get(hor)).style("font-weight", "bold");
      d3.select("#task-"+d.get(vert)).style("font-weight", "bold");      
      d3.select("#participant-"+d.get(hor)).style("fill", d3.rgb(app.palette[5]));
      d3.select("#task-"+d.get(vert)).style("fill", d3.rgb(app.palette[5]));
    })
    .on("mouseleave", function(d, i) { 
      d3.select("#Label-for-index-"+i).style("fill-opacity", "0%"); 
      d3.select("#bg-for-index-"+i).style("fill-opacity", "0%"); 
    
      d3.select("#participant-"+d.get(hor)).style("font-weight", "normal");
      d3.select("#task-"+d.get(vert)).style("font-weight", "normal");   
      d3.select("#participant-"+d.get(hor)).style("fill", "#000");
      d3.select("#task-"+d.get(vert)).style("fill", "#000");
    });
  
  app.heatmaprects = app.heatmap.append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .style("fill", function (d) {
      return d3.rgb(app.renderScale(d.get(heatmapView.currentParameter)));
    });
  
  app.heatmaplabelbg = app.heatmap.append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize*0.45 - tilePadding)
    .attr("y", gridSize*0.55)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("id", function(d, i) { return "bg-for-index-"+i; })
    .style("fill", function (d) {
      return d3.rgb(0,0,0);
    })
    .attr("class", "heatmap-label-bg");
  
  app.heatmaplabels = app.heatmap.append("text")
    .text(function(d){ return d.get(heatmapView.currentParameter); })
    .attr("transform", "translate(10, "+ (gridSize-10) +")") //can be done with x and y attributes
    .attr("class", "heatmap-label")
    .attr("id", function(d, i) { return "Label-for-index-"+i; });
  
  var participantNames = _.map(app.participants.where({project_id: app.project_id}), function(p) {return p.get("name")});
  var personaNames = _.map(app.participants.where({project_id: app.project_id}), function(p) {return p.get("persona_desc")});
  var participantsIds = _.map(app.participants.where({project_id: app.project_id}), function(p) {return p.get("id")});
  var xArr = _.zip(participantNames, personaNames, participantsIds);
  var taskNames = _.map(app.tasks.where({project_id: app.project_id}), function(t) {return t.get("name")});
  var taskIds = _.map(app.tasks.where({project_id: app.project_id}), function(t) {return t.get("id")});
  var yArr = _.zip(taskNames, taskIds);
  var textHeight = null;
  
  app.horAxesA = app.svgcanvas.selectAll("text .participants").data(xArr).enter().append("text")
    .text(function(d) { return d[0]; })
    .attr("class", "axes-label")
    .attr("id", function(d) { return "participant-"+ d[2]; })
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
      return ((gridSize) * (i)) - (gridSize/2) + tilePadding*3;// + textHeight;
    })
    .attr("x", function() { return tilePadding;})
    .attr("class", "axes-label")
    .attr("id", function(d) { return "task-"+ d[1]; })
    .text(function(d) { return d[0]; })
    .call(wrap, gridSize, textHeight);
  
  renderLegend(30);
  
  };

function renderBoxChart() {
  var cWidth = $("#app-container").width();
  var set = _.pluck(app.statistics[1], heatmapView.currentParameter);
  
  app.boxchart = app.svgcanvas.append("g").selectAll("rect").data(set).enter().append("rect")
    .attr("x", function(d, i) {
      return gridSize+tilePadding + (cWidth*(d.mean-d.interval));
    })
    .attr("y", function(d, i) {
      return gridSize*(i)+tilePadding + (2*gridSize);
    })
    .attr("width", function(d, i) {
      return cWidth*(d.interval*2);
    })
    .attr("height", function() {
      return gridSize-tilePadding;
    })
    .style("fill", function(d,i) {return colorbrewer[colors][5][2]});  
  
  app.boxScale = d3.scale.linear().domain([0,100]).range([0,cWidth]);
  app.axis = d3.svg.axis().scale(app.boxScale).orient("top").ticks(20).tickSize(-(gridSize*nVert+tilePadding + (2*gridSize)));
  app.boxAxis = app.svgcanvas.append("g")
      .attr("class", "box-axis")
      .attr("transform", "translate("+gridSize+"," + gridSize*1.9 + ")")
      .call(app.axis);
  
  app.boxchartlabels = app.svgcanvas.append("g").selectAll("text").data(set).enter().append("text")
    .attr("x", function(d, i) {
      return gridSize+tilePadding + (cWidth*(d.mean-d.interval));
    })
    .attr("y", function(d, i) {
      return gridSize*(i)+tilePadding + (2.8*gridSize);
    })
    .text(function(d, i) {
      console.log("switch to " + heatmapView.currentParameter);
      switch(heatmapView.currentParameter) {
        case "tasktime": return parseInt((d.mean-d.interval)) + "s ~ " + parseInt((d.mean+d.interval)) + "s"; break;
        case "satisfaction": console.log("satisfaction"); return (d.mean-d.interval).toFixed(1) + "s ~ " + (d.mean+d.interval).toFixed(1) + "s"; break;
        default: return parseInt((d.mean-d.interval)*100) + "% ~ " + _.min([100, parseInt((d.mean+d.interval)*100)]) + "%"; break;
      };
    })
    .attr("class", "boxchart-label");
}

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
