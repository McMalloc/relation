Relation2.Store = DS.Store.extend({

});

// Override the default adapter with the `DS.ActiveModelAdapter` which
// is built to work nicely with the ActiveModel::Serializers gem.
Relation2.ApplicationAdapter = DS.ActiveModelAdapter.extend({

});
