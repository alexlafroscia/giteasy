import Ember from 'ember';

export default Ember.Object.extend({

  user: null,
  accessToken: null,

  init: function() {
    if (Ember.isPresent(localStorage.accessToken)) {
      this.set('accessToken', localStorage.accessToken);
      this.loginUser();
    }
  },


  organizations: function() {
    var user = this.get('user');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      user.orgs(function(err, orgs) {
        // Handle the error if there is one
        if (!Ember.isBlank(err)) {
          reject(err);
        } else {
          resolve(orgs);
        }
      });
    });
  }.property('user'),


  allRepos: function() {
    var user = this.get('user');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      user.repos(function(err, repos) {
        if (!Ember.isBlank(err)) {
          reject(err);
        } else {
          resolve(repos);
        }
      });
    });
  }.property('user'),


  loginUser: function() {
    var github = new Github({
      token: this.get('accessToken'),
      auth: 'oauth'
    });

    // Store the github property
    this.set('github', github);

    // Set the user property
    var user = github.getUser();
    this.set('user', user);

    user.repos(function(err, repos) {
      console.debug(repos);
    });

  }.observes('accessToken')

});
