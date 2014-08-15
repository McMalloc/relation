// Defining name space
var app = app || {};
var percentComplete = 0;

app.HeatmapView = Backbone.View.extend({
    
    initialize: function(){
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method  
      this.currentParameter = "tasktime";
      this.render(); // not all views will render themselves, but this will
    },
                  
    handleProgress: function(evt){
        if (evt.lengthComputable) {  
            percentComplete = evt.loaded / evt.total;
        }
        $("#loading-bar").css("width", Math.round(percentComplete * 100)+"%")
    },

    /* ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
       comment
       ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲  */
    events: {
      "click .switch": "switch",
      "click .replaceSet": "replaceSet",
      "click .diff": "diffmap"
    },
    
    diffmap: function(event) {
      var mapIdxs = event.target.dataset.action.split(" ");
      var diffset = buildDiffMap(mapIdxs[0], mapIdxs[1]);
      renderDiffMap(diffset, "task_id", "participant_id", heatmapView.currentParameter);
    },
  
    replaceSet: function(event) {
      replaceSet(event.target.dataset.action, "task_id", "participant_id", heatmapView.currentParameter);
    },
  
    switch: function(event) {
      this.currentParameter = event.target.dataset.action;
      changeParameter(event.target.dataset.action);
    },
      
    // Initial render function. D3 will take it from there
    render: function(el){
      $("#loading-bar").css("width", "30%");
      initCanvas(1311, 800, "#app-container");
      var template = {
                      project_id: "",
                      prototype_id: 1,
                      participant_id: "all",
                      task_id: "all"
                      };

      var thisView = this;
      app.tasks.fetch();
      app.participants.fetch();
      app.prototypes.fetch({
            xhr: function() {
              var xhr = $.ajaxSettings.xhr();
              xhr.onprogress = thisView.handleProgress;
              return xhr; 
            },
            success: function() {
              renderHeatmap(1, "task_id", "participant_id", heatmapView.currentParameter);
              $(".ajax-loader").css("visibility", "hidden");
            }
      });
    },
});

app.PrototypeModel = Backbone.Model.extend({
  defaults: {
    moniker: ""
  }
});

app.Prototypes = Backbone.Collection.extend({
  model: app.PrototypeModel,
  url: function() {
    // REST calls to the rails JSON API
    //return this.id ? "fetch/prototypes?prototype_id=" + this.id : "prototypes";
    return "fetch/prototypes?prototype_id=all";
  }
});

app.TaskModel = Backbone.Model.extend();
app.Tasks = Backbone.Collection.extend({
  model: app.TaskModel,
  url: function() {
    // REST calls to the rails JSON API
    return "fetch/tasks?task_id=all";
  }
});

app.ParticipantModel = Backbone.Model.extend();
app.Participants = Backbone.Collection.extend({
  model: app.ParticipantModel,
  url: function() {
    // REST calls to the rails JSON API
    return "fetch/participants?participant_id=all";
  }
});

app.prototypes = new app.Prototypes;
app.tasks = new app.Tasks;
app.participants = new app.Participants;