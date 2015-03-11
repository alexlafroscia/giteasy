import Ember from 'ember';
import config from './config/environment';
import googlePageview from './mixins/google-pageview';

var Router = Ember.Router.extend(googlePageview, {
  location: config.locationType
});

Router.map(function() {
  this.route('index', {path: '/'});
  this.route('oauth');
  this.route('choose', {path: '/choose'});
  this.route('repo', {path: ':owner_id/:repo_id'}, function() {
    this.route('editFile', {path: 'files/*file_path/edit' });
    this.route('files', {path: 'files/*file_path' });
  });
});

export default Router;
