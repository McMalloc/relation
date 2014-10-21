var app = app || {};
app.pendingMarkers = []

function renderPlaybar() {
  var width = $("#playbar").width();
  
  playbarCanvas = d3.select("#playbar")
    .append("svg")
    .attr("width", width)
    .attr("height", 65);
  
  playbarD3 = playbarCanvas
    .append("rect")
    .attr("width", width)
    .attr("height", 30)
    .style("fill", d3.rgb("#9bd09b"));
  
  playbarProgressD3 = playbarCanvas
    .append("rect")
    .attr("width", width)
    .attr("height", 30)
    .style("fill", d3.rgb("#359f62"));
};

function createMarker(code, severity, position, pass_id) {
  var marker = new app.MarkerModel({
    code: code,
    severity: severity,
    position: position,
    pass_id: app.currentPassId
  });
  //marker.save(); // doesn't work shit
  app.markers.add(marker);
  app.pendingMarkers.push(marker);
  console.dir(app.pendingMarkers);
}

app.MarkerRecorderView = Backbone.View.extend({
  initialize: function(options) {
    _.templateSettings = {
      interpolate : /\{\{=(.+?)\}\}/g,
      escape : /\{\{-(.+?)\}\}/g,
      evaluate: /\{\{(.+?)\}\}/g,
      };
    this.options = options;
    _.bindAll(this, 'render');
    this.render();
  },
  events: {
    "click .create-marker": "createMarker",
    "click .save": "saveCodes"
  },
  render: function() {
    asyncRender();
  },
  
  saveCodes: function() {
    console.log(app.currentPass.get("tasktime"));
    app.passForm.commit();
    console.log(app.currentPass.get("tasktime"));
    app.currentPass.save();
    var saved = _.invoke(app.pendingMarkers, "save");
    if (saved) {
      $("#app-container").append("<div class='success-msg'>Saved</div>").html();
    }
  },
  
  createMarker: function(event) {
    var code = event.target.dataset.action.split(" ")[0];
    var severity = event.target.dataset.action.split(" ")[1];
    var position = document.getElementById("videoframe").currentTime;
    var pass_id = app.current_pass;
    createMarker(code, severity, position, pass_id);
    $("#marker-buttons").append("<div class='new-marker'>" + code + ": " + severity + " at " + Math.round(position) + " sec</div>").html();
    addMarkerTag(code, position);
  }
});

function addMarkerTag(code, position, exists) {
  if (!exists) {
    var pixelPos = parseInt(playbarProgressD3.attr("width"));
  } else {
    var pixelPos = position*(playbarD3.attr("width")/app.currentPass.get("tasktime"));
  };
  var codeColor = d3.rgb($("#" + code + "-label").css("background-color"));
  var tagWidth = 20;
  
  var triangleData = [
    {"x": pixelPos - (tagWidth/2), "y": 40},
    {"x": pixelPos + (tagWidth/2), "y": 40},
    {"x": pixelPos, "y": 30},
    {"x": pixelPos - (tagWidth/2), "y": 40}
  ];

  var triangleFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");
    
  playbarCanvas.append("rect")
    .attr("width", tagWidth)
    .attr("height", 40)
    .attr("y", 40)
    .attr("x", function() {
      return pixelPos - (tagWidth/2);
    })
    .style("fill", function() {
      console.log("fill "+ codeColor);
      return codeColor;
    })
    .attr("stroke-width", 1)
    .style("stroke", function() {
      return codeColor.brighter();
    });
    
  playbarCanvas.append("path")
    .attr("d", triangleFunction(triangleData))
    .style("fill", function() {
      return codeColor;
    })
    .attr("stroke-width", 1)
    .style("stroke", function() {
      return codeColor.brighter();
    });;
  
  /*playbarCanvas.append("text")
    .attr("y", 45)
    .attr("x", function() {
      return playbarD3.attr("width")*(videoplayer.currentTime/videoplayer.duration) +8;
    })
    .text(code);
    */
}

function updateProgressBar() {
  var progressedWidth = playbarD3.attr("width")*(videoplayer.currentTime/videoplayer.duration)
  playbarProgressD3.attr("width", progressedWidth);
}

function asyncRender() {
  var complete = _.invoke([app.tasks, app.participants, app.passes], 'fetch');
    // when all of them are complete
  $.when.apply($, complete).done(function () {
        app.currentPass = app.passes.get(app.currentPassId);
        var headlineTemplate = _.template($('#headline-tmpl').html(), {
                                          task:  app.tasks.get(app.passes.get(app.currentPassId).get("task_id")).get("name"),
                                          participant: app.participants.get(app.passes.get(app.currentPassId).get("participant_id")).get("name"),                                      
                                          });
        $("#headline").append(headlineTemplate);
        var codes = ["WRONG", "IRRITATION", "LOST", "CART-VIEW", "PURCHASE-BUTTON"];//app.markers.codes();
        var severities = ["S0", "S1", "S2", "S3", "S4"]

        var buttonTemplate = _.template($('#marker-button-tmpl').html(), 
                                            {codes: codes, 
                                             severities: severities, 
                                            });
        $("#marker-buttons").append(buttonTemplate);

        app.passForm = new app.PassForm({
          model: app.currentPass
        }).render();
        $("#marker-buttons").append(app.passForm.el);
        renderPlaybar();
        videoplayer = document.getElementById("videoframe");
        videoplayer.controls = true; //false after implementing custom controls
        videoplayer.addEventListener('timeupdate', updateProgressBar, false);
        _.each(app.currentPass.get("markers"), function(e, i, a) {
          addMarkerTag(e.code, e.position, 1);
        });
  });
}

$(document).ready( function() {
  
  markerRecorderView = new app.MarkerRecorderView({
    el: $("#app-container")
  });
  console.log("Instance created in: " + markerRecorderView.el.nodeName +" with the name "+ markerRecorderView.el.id);
  //markerRecorderView.render();
});