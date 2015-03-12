import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';

// Testing
import { defineFixture } from 'ic-ajax';
import { repos as RepoFixtures } from '../fixtures';

var application, server;

module('Acceptance: Choose', {
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

test('Choose page shows list of user\'s repositories', function(assert) {
  visit('/choose');

  andThen(function() {
    var repoList = find('.card-list li');
    var count = repoList.size();
    assert.equal(count, 5, 'Repo list should display 5 repositories');
  });
});

test('Filtered repos matches input text', function(assert) {
  visit('/choose');
  fillIn('.repo-filter', 'GitEasy');

  andThen(function() {
    var repoList = find('.card-list li');
    var count = repoList.size();
    assert.equal(count, 1, 'Repo list should display 1 repositories');
  });
});

test('Selecting a repo list item brings you to a repo page', function(assert) {
  visit('/choose');
  click('.card-list li:eq(0) a');

  andThen(function() {
    assert.equal(currentRouteName(), 'repo.index', 'Navigated to repo route');
  });
});
