import Ember from 'ember';

export default Ember.Controller.extend({

  path: '/',

  actions: {
    refreshList: function() {
      console.debug('test');
      this.propertyWillChange('path');
    }
  }
});
