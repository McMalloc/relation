var app = app || {};

app.TableView = Backbone.View.extend({
  currentForm: {},
  currentModel: {},
  initialize: function(){
      var thisview = this;
      this.table_template = $('#table-tmpl');
      _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods with Underscore method  
      
      // replaces ERB-style template tags with <<-style template tags to avoid conflicts
      // no moustaches because of visual conflicts with js brackets, e.g. {{ )}; }}
      _.templateSettings = {
        interpolate : /\<\<=(.+?)\>\>/g,
        escape : /\<\<-(.+?)\>\>/g,
        evaluate: /\<\<(.+?)\>\>/g
      };
      console.log("Fetching now...");
      var complete = _.invoke([app.tasks, app.participants, app.passes], 'fetch');
      $.when.apply($, complete).done(function() {
        console.log("Fetching complete.");
        thisview.render(); // not all views will render themselves, but this will
      });
    },
  
  events: {
    "click .new-task": "newTask",
    "click .new-participant": "newParticipant",
    "click .new-pass": "newPass",
    "click .submit-modal": "submit",
    "click .cancel-modal": "detach",
    "click .pass-cell": "editPassView"
  },
  
  editPassView: function(event) {
    var selectedPass = app.passes.where({
      task_id: parseInt(event.target.dataset.taskid),
      participant_id: parseInt(event.target.dataset.participantid),
      prototype_id: 1
    });
    console.dir(selectedPass);
    window.location.href = 'mark?pass_id=' + selectedPass[0].get("id");
  },
  
  render: function(){
      $(".ajax-loader").css("visibility", "hidden");
      var tableTemplate = _.template(this.table_template.html(), {
        tasks: app.tasks.where({project_id: app.project_id}).pluck("name"), 
        participants: app.participants.where({project_id: app.project_id}).pluck("name"),
        task_ids: app.tasks.where({project_id: app.project_id}).pluck("id"),
        participant_ids: app.participants.where({project_id: app.project_id}).pluck("id")
      });
      $("#app-container").append(tableTemplate);
  },
  
  update: function() {
    $("#overview-table").remove();
    this.render();
  },
  
  detach: function() {
    this.currentModel.destroy();
    this.currentForm.el.remove();
  },
  
  submit: function() {
    console.log("submit!");
    this.currentForm.commit();
    this.currentModel.save({}, {
      success: function() {
        console.log("wrote to database");
        app.tableview.update();
      }
    });
    this.currentForm.el.remove();
  },
  
  newParticipant: function() {
    var participant = app.participants.create({

    })
    var form = new app.ParticipantForm({
      model: participant
    }).render();
    /*
      var form = new app.TaskForm({
        model: new app.TaskModel() // empty object, will be send to database when submitting the form
        // enables server-side validation
      }).render();
    */
    this.currentForm = form;
    this.currentModel = participant;
    $("#new-participant-modal-body").append(form.el);
  },
  
  newTask: function() {
    var task = app.tasks.create({
      name: "",
      description: ""
    })
    var form = new app.TaskForm({
      model: task
    }).render();
    /*
      var form = new app.TaskForm({
        model: new app.TaskModel() // empty object, will be send to database when submitting the form
        // enables server-side validation
      }).render();
    */
    this.currentForm = form;
    this.currentModel = task;
    $("#new-task-modal-body").append(form.el);
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