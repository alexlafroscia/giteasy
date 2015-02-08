import Ember from 'ember';

export default Ember.Controller.extend({
  repo: Ember.computed.alias('session.currentRepo'),
  path: '/',
  token: Ember.computed.alias('session.accessToken'),
  owner: Ember.computed.alias('session.repo.owner'),
  repoName: Ember.computed.alias('session.repo.name'),

  actions: {
    refreshList: function() {
      console.debug('test');
      this.propertyWillChange('path');
    }
  }
});
