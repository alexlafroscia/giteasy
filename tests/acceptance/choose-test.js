import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';
import Pretender from 'pretender';
import repoEndpoints from '../pretender/repos';

var application, server;

module('Acceptance: Choose', {
  beforeEach: function() {
    server = new Pretender(repoEndpoints);
    application = startApp();
  },

  afterEach: function() {
    server.shutdown();
    Ember.run(application, 'destroy');
  }
});

test('Choose page shows list of user\'s repositories', function(assert) {
  visit('/choose');

  andThen(function() {
    var repoList = find('.card-list li');
    var count = repoList.size();
    assert.equal(count, 5, 'Choose page should display 5 repositories');
  });
});
