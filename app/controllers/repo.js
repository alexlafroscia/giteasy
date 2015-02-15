import Ember from 'ember';

export default Ember.Controller.extend({
  repo: Ember.computed.alias('session.currentRepo'),
  path: '/',

  actions: {
    refreshList: function() {
      console.debug('test');
      this.propertyWillChange('path');
    }
  }
});
