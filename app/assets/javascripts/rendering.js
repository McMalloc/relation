var width = 1200;
var height = 900;
var startX = 0;
var startY = 0;
var gridSize = 48;
var gridX = 0;
var gridY = 0;
var tilePadding = 1;
var categories = 9;
var permanent_json;
var jsons_and_scales = d3.map();
var cachedSets = [];
var nSets = 0;

function buildFetchString(fH) {
  var str = 'fetch/pass?project_id='+ fH.project_id +'&prototype_id='+ fH.prototype_id + '&task_id='+ fH.task_id +'&participant_id='+ fH.participant_id;
  console.log("Request JSON: " + str);
  return str;
}

function buildDiffMap(set1, set2, parameter) {
  var diffSet = set1.slice(0);
  $.each(diffSet, function (index, record) {
    console.log(diffSet[index][parameter] + " = " + set1[index][parameter] + " - " + set2[index][parameter]);
    diffSet[index][parameter] = set1[index][parameter] - set2[index][parameter];
  });
}

function swapSet(getRequest) {
  d3.json(getRequest, function (error, json) {
    permanent_json = json.pass;
    jsons_and_scales.set(nSets, {
      set: json.pass,
      scl: scale
    });
    nSets++;
    heatmap.data(json.pass)
      .transition()
      .style("fill", function (d) {
        return d3.rgb(scale(d["tasktime"]));
      });
  });
}

function changeParameter(parameter) {
  var scale = buildQuantitiveScale(permanent_json, parameter)
  heatmap.transition().style("fill", function (d) {
    return d3.rgb(scale(d[parameter])); //d.data*255, d.data*255, d.data*255); 
  })
}

function fetchAndRender(getRequest) {
  d3.json(getRequest, function (error, json) {
    permanent_json = json.pass;
    scale = buildQuantitiveScale(json.pass, "tasktime");
    jsons_and_scales.set(nSets, {
      set: json.pass,
      scl: scale
    });
    nSets++;
    svgcanvas = d3.select("#app-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    renderHeatmap(json.pass, scale, "task_id", "participant_id", "tasktime");
  });
}

function buildQuantitiveScale(array, parameter) {
  var mapper = d3.scale.quantize()
    .domain([Math.max.apply(Math, array.map(function (pass) {
      return pass[parameter];
    })), Math.min.apply(Math, array.map(function (pass) {
      return pass[parameter];
    }))]) // Min and Max of objects' sum attribute in the array. TODO: not safe against non quantitive data
    .range(d3.range(0, categories - 1)); // seven color categories
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

function renderHeatmap(set, scale, vert, hor, parameter) {

  heatmap = svgcanvas.selectAll("rect").data(set).enter().append("rect")
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
    }); // TODO: shows not all details, only data values
  
  labels = svgcanvas.selectAll("text").data(set).enter().append("text")
    .attr("width", gridSize)
    .attr("height", gridSize)
    .attr("x", function (d) {
      return startX + (gridSize * (d[hor] - 1)) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * (d[vert] - 1)) + tilePadding;
    })
    .text();
//  labels.append("tspan") // inherit from <text> element

};
