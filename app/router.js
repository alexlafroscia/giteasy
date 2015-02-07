import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("login");
  this.route("oauth");
  this.route("user");
  this.route("orgs");
});

export default Router;
