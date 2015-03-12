import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';

var application;

module('Acceptance: Home', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('Homepage has title and login button', function(assert) {
  visit('/');

  andThen(function() {
    var title = find('h1');
    assert.equal(title.text(), 'GitEasy');

    var login = find('.login-wrapper a');
    assert.equal(login.text(), 'Git Started!');
  });
});
