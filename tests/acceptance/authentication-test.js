import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';

// Import fixtures
import { defineFixture } from 'ic-ajax';
import { repos as RepoFixtures } from '../fixtures';

var application, container;

module('Acceptance: Authentication', {
  beforeEach: function() {

    // Define repos fixtures
    defineFixture('https://api.github.com/user/repos', {
      response: RepoFixtures,
      textStatus: 'success'
    });

    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('Login button takes user to Github oauth page if there is no token stored', function(assert) {
  assert.expect(2);

  // Clear access token
  localStorage.removeItem('accessToken');

  // Visit homepage
  visit('/');

  andThen(function() {
    assert.ok(!localStorage['accessToken'], 'Local storage token is null');
  });
  click('.login-wrapper a');
  andThen(function() {
    assert.equal('https://github.com/login/oauth/authorize?client_id=testtoken&scope=user,repo', window.testingURL, 'URL is correctly changed');
  });
});

test('Login button takes user directly to choose page if there is a stored token', function(assert) {
  assert.expect(2);

  // Set access token
  localStorage.setItem('accessToken', 'my-test-token');

  // Visit homepage
  visit('/');

  andThen(function() {
    assert.ok(localStorage['accessToken'], 'Local storage token is not null');
  });
  click('.login-wrapper a');
  andThen(function() {
    assert.equal('choose', currentRouteName(), 'URL is correctly changed');
  });
});

test('Oauth route accepts token and sets it in the app', function(assert) {
  assert.expect(1);

  // Clear access token
  localStorage.removeItem('accessToken');

  visit('/oauth?access_token=my-test-token');

  andThen(function() {
    assert.equal(localStorage['accessToken'], 'my-test-token', 'Access token was correctly cached in localStorage');
  });
});
