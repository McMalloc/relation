var app = app || {};

app.TableView = Backbone.View.extend({
  currentForm: {},
  currentModel: {},
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
    "click .new-pass": "newPass",
    "click .submit": "submit",
    "click .cancel-modal": "detach"
  },
  
  render: function(){
    console.log("rendering. Fetching now...");
    var complete = _.invoke([app.tasks, app.participants, app.passes], 'fetch');
    // when all of them are complete
    $.when.apply($, complete).done(function() {
      console.log("Fetching complete.");
      $(".ajax-loader").css("visibility", "hidden");
      var tableTemplate = _.template($('#table-tmpl').html(), {tasks: app.tasks.pluck("name"), participants: app.participants.pluck("name")});
      $("#app-container").append(tableTemplate);
    });
  },
  
  detach: function() {
    this.currentForm.el.remove();
  },
  
  submit: function() {
    console.log("submit!");
    this.currentForm.commit();
    this.currentModel.save({
      success: function() {
        console.log("successfully saved.");
        this.render();
      }
    });
    this.currentForm.el.remove();
  },
  
  newTask: function() {
    var task = new app.TaskModel({
      name: "Hey",
      description: "Ho"
    });
    var form = new app.TaskForm({
      model: task
    }).render();
    this.currentForm = form;
    this.currentModel = task;
    app.Tasks.add(task);
    $("#new-task-modal-body").append(form.el);
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