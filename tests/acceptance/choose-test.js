import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';

// Testing
import { defineFixture } from 'ic-ajax';
import { repos as RepoFixtures } from '../fixtures';

var application;

module('Acceptance: Choose', {
  beforeEach: function() {

    // Define repos fixtures
    defineFixture('https://api.github.com/user/repos', {
      response: RepoFixtures,
      textStatus: 'success'
    });

    defineFixture('https://api.github.com/repos/alexlafroscia/giteasy', {
      response: RepoFixtures[0],
      textStatus: 'success'
    });

    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('Choose page shows list of user\'s repositories', function(assert) {
  assert.expect(2);
  visit('/choose');

  andThen(function() {
    assert.equal(currentRouteName(), 'choose', 'Correct route is activated');
    var repoList = find('.card-list li');
    var count = repoList.size();
    assert.equal(count, 5, 'Repo list should display 5 repositories');
  });
});

test('Filtered repos matches input text', function(assert) {
  assert.expect(1);
  visit('/choose');
  fillIn('.repo-filter', 'GitEasy');

  andThen(function() {
    var repoList = find('.card-list li');
    var count = repoList.size();
    assert.equal(count, 1, 'Repo list should display 1 repositories');
  });
});

test('Selecting a repo list item brings you to a repo page', function(assert) {
  assert.expect(2);
  visit('/choose');
  andThen(function() {
    assert.equal(currentRouteName(), 'choose', 'Started on the correct route');
  });
  click('.card-list li:eq(0) a');
  andThen(function() {
    assert.equal(currentRouteName(), 'repo.index', 'Navigated to repo route');
  });
});
