// Defining name space
var app = app || {};

app.HeatmapView = Backbone.View.extend({

  initialize: function () {
    _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method  
    this.currentParameter = "tasktime";
    this.setId = app.prototype_ids[0];
    this.viewMode = "emp";
    this.markerView = false;
    this.diffset = false;

    // replaces ERB-style template tags with mustache style template tags to avoid conflicts
    _.templateSettings = {
      interpolate: /\{\{=(.+?)\}\}/g,
      escape: /\{\{-(.+?)\}\}/g,
      evaluate: /\{\{(.+?)\}\}/g,
    };

    this.render(); // not all views will render themselves, but this will
  },

  /* ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
       comment
       ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲  */
  events: {
    "click .switch": "switch",
    "click .marker-switch": "markerSwitch",
    "click .replaceSet": "replaceSet",
    "click .diff": "diffmap",
    "click .changeView": "changeView",
    "click .toggleColor": "toggleColor"
  },

  toggleColor: function() {
    if (colors=="YlGnBu") {
      colors = "Greys"; buildScale(); changeParameter();
    } else {
      colors = "YlGnBu"; buildScale(); changeParameter();
    };
  },
  
  toggleElement: function (element, visible) {
    if (visible) {
      $(element).css("visibility", "visible");
    } else {
      $(element).css("visibility", "hidden");
    };
  },
  
  changeView: function(event) {
    var action = event.target.dataset.action;
    if (action=="stat") {
      heatmapView.viewMode = "stat";
      _.invoke([app.boxchart, app.boxchartlabels], "style", "visibility", "visible");
      _.invoke([app.heatmap, app.horAxesA, app.horAxesB, app.legend], "style", "visibility", "hidden");
    };
    if (action=="emp") {
      heatmapView.viewMode = "emp";
      _.invoke([app.boxchart, app.boxchartlabels], "style", "visibility", "hidden");
      _.invoke([app.heatmap, app.horAxesA, app.horAxesB, app.legend], "style", "visibility", "visible");
      app.heatmaprects.style("fill", d3.rgb("#fff"));
    };
    changeParameter();
  },
  
  diffmap: function (event) {
    this.viewMode = "diff"
    var mapIdxs = event.target.dataset.action.split(" ");
    buildDiffMap(parseInt(mapIdxs[0]), parseInt(mapIdxs[1]));
    buildScale();
    renderDiffMap();
  },

  replaceSet: function (event) {
    if (this.viewMode=="diff") { 
      this.viewMode = "emp"
    };
    buildScale();
    this.setId = parseInt(event.target.dataset.action);
    replaceSet();
    changeParameter();
  },

  markerSwitch: function (event) {
    this.markerView = true
    this.toggleElement("#marker-button-bar", true);
    this.currentParameter = event.target.dataset.action;
    if (this.viewMode=="diff") {buildDiffMap(app.prototype_ids[0], app.prototype_ids[1]);}
    buildScale();
    changeParameter();
  },

  switch: function (event) {
    this.markerView = false
    this.toggleElement("#marker-button-bar", false);
    this.currentParameter = event.target.dataset.action;
    if (this.viewMode=="diff") {buildDiffMap(app.prototype_ids[0], app.prototype_ids[1]);}
    buildScale();
    changeParameter();
  },

  // Initial render function. D3 will take it from there
  render: function (el) {
    initCanvas($("#app-container").width()+100, Math.max(document.documentElement.clientHeight, window.innerHeight || 0), "#app-container");
    var thisView = this;
    // invoke the fetch method on all collections and keep their returns in the complete variable
    var complete = _.invoke([app.tasks, app.participants, app.passes], 'fetch');
    // when all of them are complete
    $.when.apply($, complete).done(function () {
      calculateStatistics();
      app.markers = new app.Markers(_.flatten(app.passes.pluck("markers")));
      renderHeatmap();
      renderBoxChart();
      //app.boxchart.style("visibility", "hidden");
      _.invoke([app.heatmap, app.horAxesA, app.horAxesB, app.legend], "style", "visibility", "visible");
      $(".ajax-loader").css("visibility", "hidden");
      var codeArr = app.markers.codes();
      var buttonBarTemplate = _.template($('#marker-button-bar-tmpl').html(), {
        codes: codeArr
      });
      $("#buttonbar").append(buttonBarTemplate);
      $("#marker-button-bar").css("visibility", "hidden");
      $("#marker-button-bar").css("margin-left", $("[name='tasktime']").css("width"));
    });
  }
});

// TODO: dynamical for prototypes and parameters or marker types

function calculateStatistics() {
  app.statistics = {1: {}, 2: {}}; 
  var parameters = ["tasktime", "satisfaction"]; //, "completed"];
  var markers = ["ANGER", "ANNOYANCE", "CONFUSION", "IRRITATION", "LOST", "all", "completed"]
  
  app.tasks.each(function (task) {
    if (task.get("project_id") == app.project_id) {
      for (var i = 1; i<3; i++) {
      app.statistics[+i][task.get("id")] = {};  
        $.each(markers, function (j, marker) {
          app.statistics[+i][task.get("id")][marker] = utilinterval(_.map(app.passes.where({
                  task_id: task.get("id"),
                  prototype_id: i
                }), function(m) { 
                      if (marker!="completed") {
                        return +m.get("markercounts")[marker]; 
                      } else { return +m.get("completed"); }
                    })
          );
        });
        
        $.each(parameters, function (j, parameter) {
         switch (parameter) {
              case "tasktime": 
                app.statistics[i][task.get("id")][parameter] = {
                  mean: ss.geometric_mean(utilpluck(parameter, i, task.get("id"))),
                  interval: ss.standard_deviation(utilpluck(parameter, i, task.get("id"))) / Math.sqrt(utilpluck(parameter, i, task.get("id")).length)
                }; break;
              case "satisfaction": 
                app.statistics[i][task.get("id")][parameter] = {
                  mean: ss.mean(utilpluck(parameter, i, task.get("id"))),
                  interval: ss.standard_deviation(utilpluck(parameter, i, task.get("id"))) / Math.sqrt(utilpluck(parameter, i, task.get("id")).length)
                }; break;
          }});
      
      }; //end for
    }; // end if
  });
}

function utilinterval(arr) {
  var completedAwaldMean =
    (utilsum(arr) + (Math.pow(1.96, 2))) / (arr.length + Math.pow(1.96, 2));
  var completedAwaldIntv =
    1.96 * (Math.sqrt((completedAwaldMean * (1 - completedAwaldMean)) / (arr.length + Math.pow(1.96, 2))));
  return {
    mean: completedAwaldMean,
    interval: completedAwaldIntv
  };
}            
               
function utilsum (arr) {
  return _.reduce(arr, function(memo, num){ return memo + num; }, 0);
}

function utilpluck(param, p_id, t_id) {
  var arr = _.map(app.passes.where({
                task_id: t_id,
                prototype_id: p_id
              }), function (m) {
    return +m.get(param); //TODO terrible code
  });
  return arr;
}