import Ember from 'ember';
import { module, test, skip } from 'qunit';
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

    defineFixture('https://api.github.com/repos/alexlafroscia/giteasy/contents/lib/octokit', {
      response: FileFixtures[0],
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

test('Clicking on a directory displays the list of the containing files', function(assert) {
  assert.expect(1);

  visit('/alexlafroscia/giteasy');

  click('ul.card-list li:eq(0) a');
  andThen(function() {
    assert.equal(currentRouteName(), 'repo.files', 'Navigated to the correct route');
  });
});


/**
 * The following three things are items that I would like to add tests for
 * eventually, but the file upload code itself isn't done yet, and I'm not sure
 * if it's event possible to test "drag-and-drop"-ing a file from the desktop
 * through QUnit.  There's a chance that I could write a custom test helper to
 * do this, but I think it would end up being a very complicated process and
 * possibly not worth doing at this stage of the application.
 */
skip('Clicking on a file downloads the file to the local filesystem', function(assert) {
  assert.expect(1);

  visit('/alexlafroscia/giteasy');

  click('ul.card-list li:eq(1) a');
  andThen(function() {
    // Do something in here to verify that the file download was started
    // Maybe look at making a utility method with different testing behavior,
    // like the URL changing utility?
  });
});

skip('Dragging a file onto the screen adds it to the files to be uploaded', function(assert) {
  // Is this even possible to test through QUnit??
});

skip('Clicking the `upload` button initiates an upload of the staged files', function(assert) {
  // If the previous test hasn't been implemented, this can't be either
});
