// Defining name space
var app = app || {};

app.HeatmapView = Backbone.View.extend({
    
    initialize: function(){
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method     
      this.render(); // not all views will render themselves, but this will
    },
    
    events: {
      "click .switch": "switch",
    },
    
    switch: function(event) {
      console.log("Switching to: " + event.target.dataset.action);
      changeParameter(event.target.dataset.action); // do with callback
    },
    
    // Initial render function. D3 will take it from there
    render: function(el){
      initCanvas(1200, 800, "#app-container");
      var fetchString = buildFetchString({
                          project_id: "",
                          prototype_id: 1,
                          participant_id: "all",
                          task_id: "all"
                        });
      fetchIntoModel(fetchString);
    },
});

app.DatasetModel = Backbone.Model.extend({
  initialize: function() {
    this.on("change:dataset", function(item) {
      buildQuantitiveScale(item, "tasktime");
    });
    this.on("change:scale", function(item) {
      //renderHeatmap(item, "task_id", "participant_id", "tasktime");
    });
    this.on("change:render", function(item) {
      renderHeatmap(item, "task_id", "participant_id", "tasktime");
    });
  },
  
  dataset: [], // json array
  scale: null, // d3.scale object
  visType: "", // Heatmap, Barchart, etc.
  fetchedWith: "" // string with fetch URL  
});
  
app.DatasetCollection = Backbone.Collection.extend({  
  initialize: function() {
    this.on("add", function(item) {
      this.last = item;
    })
  },
  
  model: app.DatasetModel,
  current: null,
  last: null,
})

app.datasets = new app.DatasetCollection();