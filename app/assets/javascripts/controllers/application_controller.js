Relation2.ApplicationController = Ember.Controller.extend({
  entries: [],
  addEntry: function() {
    this.entries.pushObject({
      name: this.get('newEntryName')
    });
    return this.set('newEntryName', "");
  }
});
