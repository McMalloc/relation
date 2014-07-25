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
var jsons_and_scales = d3.map();
var sizeMem = [];
var nSets = 0;

jQuery(function () {
  $('#show_tasktime').button();
  $('#show_sum').button();
  $('#show_satisfaction').button();
  $('#show_proto1').button();
  $('#show_proto2').button();
  $('#show_diff').button();

  $('#show_sum').on('click', function (e) {
    changeParameter("markercount");
  });
  $('#show_tasktime').on('click', function (e) {
    changeParameter("tasktime");
  });
  $('#show_satisfaction').on('click', function (e) {
    changeParameter("satisfaction");
  });

  $('#show_proto1').on('click', function (e) {
    changeSet("fetch/pass?prototype_id=1");
  });
  $('#show_proto2').on('click', function (e) {
    changeSet("fetch/pass?prototype_id=2");
  });
  $('#show_diff').on('click', function (e) {
    buildDiffMap(jsons_and_scales.get(0).set, jsons_and_scales.get(1).set, "tasktime");
  });
});

function buildDiffMap(set1, set2, parameter) {
  var diffSet = set1.slice(0);
  $.each(diffSet, function (index, record) {
    console.log(diffSet[index][parameter] + " = " + set1[index][parameter] + " - " + set2[index][parameter]);
    diffSet[index][parameter] = set1[index][parameter] - set2[index][parameter];
  });
  console.dir(diffSet);
  console.dir(set1);
  console.dir(set2);
}

function changeSet(getRequest) {
  d3.json(getRequest, function (error, json) {
    permanent_json = json;
    jsons_and_scales.set(nSets, {
      set: json,
      scl: scale
    });
    nSets++;
    heatmap.data(json)
      .transition()
      .style("fill", function (d) {
        return d3.rgb(scale(d["tasktime"]))
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
    permanent_json = json;
    scale = buildQuantitiveScale(json, "tasktime");
    jsons_and_scales.set(nSets, {
      set: json,
      scl: scale
    });
    nSets++;
    svgcanvas = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    renderHeatmap(json, scale, "task_id", "participant_id", "tasktime");
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
  var factor = 10;
  rect.parentNode.appendChild(rect); // move to the top!
  var selection = d3.select(rect);
  if (sizeMem.length == 0) {
    var oldX = selection.attr("x");
    var oldY = selection.attr("y");
    sizeMem.push(gridSize - tilePadding, gridSize - tilePadding, oldY, oldX)
    selection.transition().duration(100)
      .attr("x", function () {
        return (oldX - factor);
      })
      .attr("y", function () {
        return (oldY - factor);
      })
      .attr("width", function () {
        return (gridSize - tilePadding + (factor * 2));
      }) //return (oldW+20); })
    .attr("height", function () {
      return (gridSize - tilePadding + (factor * 2));
    });
  } else {
    selection.transition().duration(100)
      .attr("x", function () {
        return sizeMem.pop();
      })
      .attr("y", function () {
        return sizeMem.pop();
      })
      .attr("width", function () {
        return sizeMem.pop();
      })
      .attr("height", function () {
        return sizeMem.pop();
      });
  }
}

function renderHeatmap(set, scale, vert, hor, parameter) {

  heatmap = svgcanvas.selectAll("rect").data(set).enter().append("rect")
    .attr("width", gridSize - tilePadding)
    .attr("height", gridSize - tilePadding)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return startX + (gridSize * d[hor]) + tilePadding;
    })
    .attr("y", function (d) {
      return startY + (gridSize * d[vert]) + tilePadding;
    })
    .style("fill", function (d) {
      return d3.rgb(scale(d[parameter])); //d.data*255, d.data*255, d.data*255); 
    })
    .attr("title", function (d, i) {
      return d[parameter];
    })
    .on("mouseenter", function (d, i) {
      expandRect(this);
      showDetail(i, true);
    })
    .on("mouseout", function (d, i) {
      showDetail(i, false);
      expandRect(this);
    }); // TODO: shows not all details, only data values

  labels = svgcanvas.selectAll("text").data(set).enter().append("text")
    .attr("x", function (d) {
      return startX + 4 + (gridSize * d[hor]) + tilePadding;
    })
    .attr("y", function (d) {
      return startY - 4 + gridSize + (gridSize * d[vert]) + tilePadding;
    })
    .attr("class", "tile-label");
  labels.append("tspan")
    .attr("dy", "-1.4em")
    .text(function (d, i) {
      return (d[hor]) + ", " + (d[vert]) + ": ";
    }) // TODO: make flexible 
  .attr("class", "tile-label small");
  labels.append("tspan") // inherit from <text> element
  .attr("dy", "0.8em")
    .text(function (d, i) {
      return d[parameter];
    }); // TODO: label is not exact anymore, .data will suffice			
};
fetchAndRender('fetch/pass?prototype_id=1');