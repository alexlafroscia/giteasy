import Ember from 'ember';

export default Ember.Route.extend({

  github: Ember.inject.service(),

  model: function() {
    return this.get('github').request('user/repos');
  }
});
