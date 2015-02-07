import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var user = this.session.get('user');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      user.repos(function(err, repos) {
        if (!Ember.isBlank(err)) {
          reject(err);
        } else {
          resolve(repos);
        }
      });
    });
  }
});
