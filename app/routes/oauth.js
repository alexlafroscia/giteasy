import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(transition) {
    var params = transition.queryParams;
    localStorage.setItem('accessToken', params.access_token);
    this.session.set('accessToken', params.access_token);
    this.transitionTo('choose');
  }
});
