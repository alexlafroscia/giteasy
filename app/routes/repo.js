import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var github = this.session.get('github');
    var repo = github.getRepo(params.owner_id, params.repo_id);
    this.session.set('currentRepo', repo);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      repo.show(function(err, repo) {
        if (!Ember.isBlank(err)) {
          reject(err);
        } else {
          resolve(repo);
        }
      });
    });
  }
});
