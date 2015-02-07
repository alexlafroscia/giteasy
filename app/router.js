import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("index", {path: "/"});
  this.route("login");
  this.route("user");
  this.route("oauth");
  this.route("choose", {path: "/choose"});
  this.route("repo", {path: ":owner_id/:repo_id"}, function() {
    this.route("editFile");
  });
});

export default Router;
