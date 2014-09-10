var app = app || {};


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
  },
  getMeans: function(attribute, parameter, parameter_id, meanFunction) {
    var query = {}
    query[parameter] = parameter_id;
    var values = _.pluck(_.where(this.get(1).get("passes"), query), attribute);
    console.dir(values);
    
    if (meanFunction == "arithmetic") {
      var sum = 0;
      for (var i = 0; i < values.length; i++)
      {
        sum += values[i];
      }
      return values.length ? sum/values.length : 0;
    };
    
    if (meanFunction == "median") {
      values.sort(function (a,b){return a - b})
      var mid = Math.floor(values.length / 2);
      if ((values.length % 2) == 1)  // length is odd
          return values[mid];
      else 
          return (values[mid - 1] + values[mid]) / 2;
    };
  },
  
});

app.TaskModel = Backbone.Model.extend();
app.Tasks = Backbone.Collection.extend({
  model: app.TaskModel,
  url: function() {
    // REST calls to the rails JSON API
    return "fetch/tasks?task_id=all";
  },
  asStringArr: function() {
    var pID = 1; // project ID. 1 for now TODO: make usable for other projects
    var array = [];
  },
  schema: {
    name:               'Text',
    description:        'Text'
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

app.PassModel = Backbone.Model.extend({
 initialize: function() {
    _.bindAll(this, "countAllMarkers");
    //this.on("add", this.countAllMarkers);
  },
  countAllMarkers: function() {
    var markerCodes = this.collection.assignedCodes;
    var thisPass = this;
    _.each(markerCodes, function(mrk, idx) {
      var attribute = mrk.code + "count";
      var value = 0;
      var plucked = _.where(thisPass.get("markers"), {code: mrk.code});
      if (plucked) { 
        var value = parseInt(_.where(thisPass.get("markers"), {code: mrk.code}).length);
      };
      thisPass.attributes[attribute] = value;
    });
  },
});
app.Passes = Backbone.Collection.extend({
  model: app.PassModel,
  url: function() {
    return "fetch/pass?project_id=1&prototype_id=all&task_id=all&participant_id=all";
  },
  assignedCodes: [],
  assignCodes: function() {
    this.assignedCodes = _.uniq(_.flatten(this.pluck("markers")));
  }
});

app.MarkerModel = Backbone.Model.extend();
app.Markers = Backbone.Collection.extend({
  model: app.MarkerModel,
  initialize: function (models,options) { },
  url: function() {
    return "fetch/markers"; // return "markers/create";
  },
  codes: function() {
    var codeArray = _.uniq(this.pluck("code")); 
    return codeArray;
  }
});

app.prototypes = new app.Prototypes;
app.passes = new app.Passes
app.tasks = new app.Tasks;
app.participants = new app.Participants;