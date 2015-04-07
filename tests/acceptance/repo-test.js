import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'giteasy/tests/helpers/start-app';

// Testing
import { defineFixture } from 'ic-ajax';
import { repos as RepoFixtures } from '../fixtures';
import { files as FileFixtures } from '../fixtures';

var application;

module('Acceptance: Repo', {
  beforeEach: function() {

    // Define repos fixtures
    defineFixture('https://api.github.com/repos/alexlafroscia/giteasy', {
      response: RepoFixtures[0],
      textStatus: 'success'
    });

    defineFixture('https://api.github.com/repos/alexlafroscia/giteasy/contents/', {
      response: FileFixtures,
      textStatus: 'success'
    });

    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('Visiting page shows the title and list of files', function(assert) {
  assert.expect(4);
  visit('/alexlafroscia/giteasy');

  andThen(function() {
    assert.equal(currentPath(), 'repo.index', 'Route has correct name');
    assert.equal(find('.repo-name').text(), 'giteasy', 'Page has correct title');
    assert.equal(find('.repo-description').text(), 'This is the description', 'Page has correct description');
    assert.equal(find('ul.card-list li').size(), 2, 'File list has correct amount of contents');
  });
});
