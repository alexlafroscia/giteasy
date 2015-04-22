import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';

var application;

module('Acceptance: GoogleAnalytics', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('logs view on page load', function(assert) {
  assert.expect(2);

  var originalGAFunction = window['ga'];

  // Catch GA requests
  window['ga'] = function(action, name, data) {
    assert.equal(name, 'pageview', 'Correct data type is sent to GA');
    assert.equal(data.page, currentURL(), 'Current URL it sent to GA');
  };

  visit('/');

  andThen(function() {
    window['ga'] = originalGAFunction;
  });
});
