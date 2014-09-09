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
  }
});



$(document).ready( function() {
  $(".ajax-loader").css("visibility", "visible");
  
  app.tableview = new app.TableView({
    el: $("#app-container")
  });
  console.log("Instance created in: " + app.tableview.el.nodeName +" with the name "+ app.tableview.el.id);
});