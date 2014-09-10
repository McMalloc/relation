var app = app || {};

app.TableView = Backbone.View.extend({
  initialize: function(){
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method  
      
      // replaces ERB-style template tags with mustache style template tags to avoid conflicts
      _.templateSettings = {
        interpolate : /\{\{=(.+?)\}\}/g,
        escape : /\{\{-(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
      };
      this.render(); // not all views will render themselves, but this will

    },
  
  events: {
    "click .new-task": "newTask",
    "click .new-participant": "newParticipant",
    "click .new-pass": "newPass"  
  },
  
  render: function(){
    console.log("rendering. Fetching now...");
    var complete = _.invoke([app.tasks, app.participants, app.passes], 'fetch');
    // when all of them are complete
    $.when.apply($, complete).done(function() {
      console.log("Fetching complete.");
      $(".ajax-loader").css("visibility", "hidden");
      console.dir(app.tasks.pluck("name"));
      var tableTemplate = _.template($('#table-tmpl').html(), {tasks: app.tasks.pluck("name"), participants: app.participants.pluck("name")});
      $("#app-container").append(tableTemplate);
    });
  },
  
  newTask: function() {
    var task = new app.TaskModel({
      name: "Hey",
      description: "Ho"
    });
    var form = new Backbone.Form({
      model: task
    }).render();
  },
  
  newParticipant: function() {
    alert("new participant!");
  },
  
  newPass: function() {
    alert("new pass!");
  }
});



$(document).ready( function() {
  $(".ajax-loader").css("visibility", "visible");
  
  app.tableview = new app.TableView({
    el: $("#app-container")
  });
  console.log("Instance created in: " + app.tableview.el.nodeName +" with the name "+ app.tableview.el.id);
});