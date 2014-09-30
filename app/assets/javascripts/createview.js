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
    "click .submit-modal": "submit",
    "click .cancel-modal": "detach",
    "click .pass-cell": "editPassView"
  },
  
  editPassView: function(event) {
    console.log("edit pass!");
    console.log(event.target.dataset.taskid, event.target.dataset.participantid);
    var selectedPass = app.passes.where({
      task_id: parseInt(event.target.dataset.taskid),
      participant_id: parseInt(event.target.dataset.participantid),
      prototype_id: app.prototype_ids[app.currentP]
    });
    console.dir(selectedPass);
    window.location.href = 'mark?pass_id=' + selectedPass[0].get("id");
  },
  
  render: function(){
      $(".ajax-loader").css("visibility", "hidden");
      var tableTemplate = _.template(this.table_template.html(), {
        tasks:            (app.tasks.where({project_id: app.project_id})).map(function(m) { return m.get("name") }),
        participants:     (app.participants.where({project_id: app.project_id})).map(function(m) { return m.get("name") }),
        task_ids:         (app.tasks.where({project_id: app.project_id})).map(function(m) { return m.get("id") }),
        participant_ids:  (app.participants.where({project_id: app.project_id})).map(function(m) { return m.get("id") }),
        passes:           (app.passes.where({project_id: app.project_id})).map(function(p) { 
                          return {
                              markercount: p.get("markercounts")["all"], 
                              tid: p.get("task_id"), 
                              pid: p.get("participant_id")
                            };
                          })
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
    this.currentForm.commit();
    this.currentModel.save({}, {
      success: function() {
        app.tableview.updatePasses();
        app.tableview.update();
      }
    });
    this.currentForm.el.remove();
  },
  
  newParticipant: function() {
    var participant = app.participants.add({
      name: "",
      persona: "",
      project_id: app.project_id
    });
    var form = new app.ParticipantForm({
      model: participant
    }).render();
    participant.set({project_id: app.project_id});
    participant.save();
    this.currentForm = form;
    this.currentModel = participant;
    $("#new-participant-modal-body").append(form.el);
  },
  
  newTask: function() {
    var task = app.tasks.create({
      name: "",
      description: "",
      project_id: app.project_id
    })
    var form = new app.TaskForm({
      model: task
    }).render();
    this.currentForm = form;
    this.currentModel = task;
    $("#new-task-modal-body").append(form.el);
  },
  
  updatePasses: function() {
    switch (this.currentModel.collection.of) {
      case "participants":
        _.each(app.tasks.where({project_id: app.project_id}), function(task) {
          var pass = app.passes.create(
            {
              participant_id: app.tableview.currentModel.get("id"),
              task_id: task.get("id"),
              prototype_id: app.prototype_ids[app.currentP], 
              project_id: app.project_id
            }
          );
          pass.save();
        });
        break;
      case "tasks":
        _.each(app.participants.where({project_id: app.project_id}), function(participant) {
          var pass = app.passes.create(
            {
              task_id: app.tableview.currentModel.get("id"),
              participant_id: participant.get("id"),
              prototype_id: app.prototype_ids[app.currentP],
              project_id: app.project_id
            }
          );
          pass.save();
        });
        break;
    };
  }
  
}); //END OF EXTEND

$(document).ready( function() {
  $(".ajax-loader").css("visibility", "visible");
  
  app.tableview = new app.TableView({
    el: $("#app-container")
  });
  console.log("Instance created in: " + app.tableview.el.nodeName +" with the name "+ app.tableview.el.id);
});