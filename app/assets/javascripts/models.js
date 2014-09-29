var app = app || {};

app.TaskModel = Backbone.Model.extend({
  schema: {
    name:               'Text',
    description:        'Text'
  },
  defaults: {
    name: "",
    description: "",
    statistics: {}
  }
});
app.Tasks = Backbone.Collection.extend({
  model: app.TaskModel,
  asStringArr: function() {
    var pID = 1; // project ID. 1 for now TODO: make usable for other projects
    var array = [];
  },
  url: 'sync/tasks',
  //url: 'tasks.json',
  of: 'participants'
});

app.TaskForm = Backbone.Form.extend();

app.ParticipantModel = Backbone.Model.extend({
  schema: {
    name: 'Text',
    persona_desc: { type: 'Select', options: ['1', '2', '3', '4'] }, //TODO personas from server
    project_id: 'Number'
  }
});
app.Participants = Backbone.Collection.extend({
  model: app.ParticipantModel,
  url: 'sync/participants',
  //url: 'participants.json',
  of: 'participants'
});

app.ParticipantForm = Backbone.Form.extend();

app.PassModel = Backbone.Model.extend({
  defaults: {
    markercounts: {},
    markers: []
  },
  schema: {
    tasktime:               'Text',
    satisfaction:        'Text',
    completed: 'Checkbox'
  },
  url: function() {
    if (this.id) {
      return 'sync/pass/'+ this.id; 
    } else {
      return 'sync/pass/';
    };
  },
  urlRoot: 'sync/pass'
  //urlRoot: 'passes.json'
});
app.PassForm = Backbone.Form.extend();

app.Passes = Backbone.Collection.extend({
  model: app.PassModel,
  assignedCodes: [],
  assignCodes: function() {
    this.assignedCodes = _.uniq(_.flatten(this.pluck("markers")));
  },
  url: function(m) {
    return 'sync/pass/'; 
  },
  //urlRoot: 'sync/pass'
  //url: 'passes.json'
});

app.MarkerModel = Backbone.Model.extend();
app.Markers = Backbone.Collection.extend({
  model: app.MarkerModel,
  url: 'markers',
  urlRoot: 'markers',
  codes: function() {
    var codeArray = _.uniq(this.pluck("code")); 
    return codeArray;
  }
});

app.passes = new app.Passes;
app.tasks = new app.Tasks;
app.participants = new app.Participants;
app.markers = new app.Markers;