import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var repo = this.session.get('currentRepo');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      repo.contents('master', '', function(err, content) {
        if (!Ember.isBlank(err)) {
          reject(err);
        } else {
          resolve(content);
        }
      });
    });
  }
});
