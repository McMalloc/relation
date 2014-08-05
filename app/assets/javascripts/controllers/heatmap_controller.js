Relation2.HeatmapController = Ember.ObjectController.extend({
  init: function() {
    fetchAndRender(buildFetchString(this.fetchHashes.template))
  },
  
  actions: {
    render: function(prop, val) {
      this.fetchHashes.template[prop] = val;
      fetchAndRender(buildFetchString(this.fetchHashes.template));
    },
    swap_set: function(prop, val) {
      this.fetchHashes.template[prop] = val;
      swapSet(buildFetchString(this.fetchHashes.template));
    },
    switch: function(param) {
      changeParameter(param);
    }
  },
                                                            
  fetchHashes: {
    template: {
      project_id: "all",
      prototype_id: 1,
      task_id: "all",
      participant_id: "all"
    }
  }
});

function buildFetchString(fH) {
  var str = 'fetch/pass?project_id='+ fH.project_id +'&prototype_id='+ fH.prototype_id + '&task_id='+ fH.task_id +'&participant_id='+ fH.participant_id;
  console.log("Request JSON: " + str);
  return str;
}

Relation2.DataController = Ember.ObjectController.extend({
  dset: null,
  dscale: null,
  did: 0
});

Relation2.DataRoute = Ember.Route.extend({
  setupController: function(controller, data) {
    controller.set('model', data);
  }
});