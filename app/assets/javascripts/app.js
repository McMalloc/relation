// Defining name space
var app = app || {}

app.HeatmapView = Backbone.View.extend({
    //el: '#app-container',
    
    initialize: function(){
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method     
      this.render(); // not all views will render themselves, but this will
    },
    
    events: {
      "click .switch": "switch",
    },
    
    switch: function(event) {
      console.log("Switching to: " + event.target.dataset.action);
      changeParameter(event.target.dataset.action);
    },
    
    render: function(el){
      fetchAndRender(buildFetchString({
        project_id: "",
        prototype_id: 1,
        participant_id: "all",
        task_id: "all"
      }));
    },
});

app.DatasetModel = Backbone.Model.extend({
  initialize: function (){},
  
  dataset: [], // json array
  scale: null, // d3.scale object
  visType: "", // Heatmap, Barchart, etc.
  fetchedWith: "" // string with fetch URL
  
});
  
app.DatasetCollection = Backbone.Collection.extend({
  initialize: function() {
    this._meta = {}
  },
  
  model: DatasetModel
  meta: function
});
