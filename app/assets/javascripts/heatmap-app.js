// Defining name space
var app = app || {};
var percentComplete = 0;

app.HeatmapView = Backbone.View.extend({
    
    initialize: function(){
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method  
      this.currentParameter = "tasktime";
      this.setId = 1;
      this.diffView = false;
      
      // replaces ERB-style template tags with mustache style template tags to avoid conflicts
      _.templateSettings = {
        interpolate : /\{\{=(.+?)\}\}/g,
        escape : /\{\{-(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
      };
      
      this.render(); // not all views will render themselves, but this will
    },

    /* ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
       comment
       ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲  */
    events: {
      "click .switch": "switch",
      "click .replaceSet": "replaceSet",
      "click .diff": "diffmap",
    },
    
    toggleElement: function(element, visible) {
      if (visible) {
        $(element).css("visibility", "visible");
      } else {
        $(element).css("visibility", "hidden");
      };
    },
  
    diffmap: function(event) {
      this.diffView = true;
      var mapIdxs = event.target.dataset.action.split(" ");
      var diffset = buildDiffMap(mapIdxs[0], mapIdxs[1]);
      renderDiffMap(diffset);
    },
  
    replaceSet: function(event) {
      this.diffView = false;
      this.setId = parseInt(event.target.dataset.action);
      replaceSet();
    },
  
    switch: function(event) {
      var eventAction = event.target.dataset.action.split(" ");
      if (eventAction[0] == "markercount") {
        this.toggleElement("#marker-button-bar", true);
        this.currentParameter = eventAction[1] + "count";
        changeParameter();
      } else {
        this.toggleElement("#marker-button-bar", false);   
        this.currentParameter = eventAction[0];
        changeParameter();
      };
    },
      
    // Initial render function. D3 will take it from there
    render: function(el){
      initCanvas($("#app-container").width()+500, 1500, "#app-container");
      var thisView = this;
      // invoke the fetch method on all collections and keep their returns in the complete variable
      var complete = _.invoke([app.tasks, app.participants, app.passes], 'fetch');
      // when all of them are complete
      $.when.apply($, complete).done(function() {
        app.markers = new app.Markers(_.flatten(app.passes.pluck("markers")));
        renderHeatmap(1, heatmapView.currentParameter);
        $(".ajax-loader").css("visibility", "hidden");
        var codeArr = app.markers.codes();
        var buttonBarTemplate = _.template($('#marker-button-bar-tmpl').html(), {codes: codeArr});
        $("#buttonbar").append(buttonBarTemplate);
        $("#marker-button-bar").css("visibility", "hidden");
        $("#marker-button-bar").css("margin-left", $("[name='tasktime']").css("width"));
      });
    }
});