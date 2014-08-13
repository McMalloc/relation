// Defining name space
var app = app || {};

app.HeatmapView = Backbone.View.extend({
    
    initialize: function(){
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method     
      this.render(); // not all views will render themselves, but this will
    },
    
    /* ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
       switch changes a parameter already present in the current
       dataset, so no AJAX request is necessary. replace does make
       an AJAX request necessary.
       ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲  */
  
    events: {
      "click .switch": "switch",
      "click .replaceSet": "replaceSet"
    },
    
    switch: function(event) {
      console.log("Switching to: " + event.target.dataset.action);
      changeParameter(event.target.dataset.action); // do with callback
    },
    
    replaceSet: function(event) {
      var template = {
                      project_id: "",
                      prototype_id: 1,
                      participant_id: "all",
                      task_id: "all"
                      };
      eventActionArray = event.target.dataset.action.split(" ");
      template[eventActionArray[0] + "_id"] = parseInt(eventActionArray[1]);
      fetchIntoModel(template);
    },
    
    // Initial render function. D3 will take it from there
    render: function(el){
      initCanvas(1200, 800, "#app-container");
      var template = {
                      project_id: "",
                      prototype_id: 1,
                      participant_id: "all",
                      task_id: "all"
                      };
      fetchIntoModel(template);
    },
});

app.DatasetModel = Backbone.Model.extend({
  initialize: function() {
    this.on("change:dataset", function(item) {
      buildQuantitiveScale(item, "tasktime");
      //item.set("render", !(item.get("render")));
    });
    this.on("render", function(item) {
      console.log("render triggered");
      renderHeatmap(item, "task_id", "participant_id", "tasktime");
    });
  },
  
  dataset: [], // json array
  visType: "", // Heatmap, Barchart, etc.
  fetchedWith: "", // string with fetch URL 
  //render: true,
  meta: {}
});
  
app.DatasetCollection = Backbone.Collection.extend({  
  initialize: function() {},
  model: app.DatasetModel
})

app.datasets = new app.DatasetCollection();