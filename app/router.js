import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("index", {path: "/"});
  this.route("oauth");
  this.route("repoDir", {path: "/repo-dir"});
  this.route("index-chooseRepo", {path: "/chooseRepo"});
  this.route("repo-dir", function() {
    this.route("editFile");
  });
  this.route("login");
  this.route("user");
  this.route("orgs");
});

export default Router;
