import Ember from 'ember';

export default Ember.Route.extend({

  github: Ember.inject.service(),

  beforeModel: function(transition) {
    var params = transition.queryParams;
    localStorage.setItem('accessToken', params.access_token);
    this.get('github').set('accessToken', params.access_token);
    this.transitionTo('choose');
  }
});
