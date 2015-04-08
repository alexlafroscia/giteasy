import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import { skip } from 'qunit';

// Text fixtures
import { defineFixture } from 'ic-ajax';
import { repos as RepoFixtures } from '../../fixtures';
import { files as FileFixtures } from '../../fixtures';

moduleForComponent('render-files', 'Component: Render Files', {
  // specify the other units that are required for this test
  needs: ['service:github'],

  beforeEach: function() {
    // Define fixtures
    defineFixture('https://api.github.com/repos/alexlafroscia/giteasy/contents/', {
      response: FileFixtures,
      textStatus: 'success'
    });
  }
});


test('it renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject({
    repo: RepoFixtures[0],
    path: '/'
  });
  assert.equal(component._state, 'preRender', 'has the correct pre-render state');

  // appends the component to the page
  this.render();
  assert.equal(component._state, 'inDOM', 'has the correct post-render state');
});


/**
 * Test if the uploader correctly handles an existing file
 */
test('it uploads an existing file correctly', function(assert) {
  assert.expect(1);

  defineFixture('https://api.github.com/repos/alexlafroscia/giteasy/contents/octokit.rb', {
    response: FileFixtures[0],
    textStatus: 'success'
  });

  var component = this.subject({
    repo: RepoFixtures[0],
    path: '/'
  });

  this.render();

  QUnit.stop();
  // Test uploading the file
  component.uploadFile(FileFixtures[0], FileFixtures[0].name)
  .then(function(data) {
    assert.equal(data.name, 'octokit.rb', 'Resolve a valid file');
    QUnit.start();
  });
});


/**
 * Test if the uploader correctly handles a new file
 *
 * Hard to test due to how I detect if the file is new or old.
 * At the moment, I ping Github's API with the would-be file path and, if an
 * error occurs, I know that the file must be new.  Then, I can include only the
 * properties that are needed for a new file, instead of those needed to update
 * an existing one.
 *
 * There are a few issues at play here:
 *
 * 1. The code that I wrote should be, and eventually will be, smarter, so that
 *    the app knows ahead of time if the file is an update or new file.  This
 *    will be necessary anyway to handle UX things that I want to improve, but I
 *    just haven't had time to get to that yet.
 * 2. The endpoint-mocking library that I'm using does not differentiate between
 *    `GET` and `PUT` requests.  If it did, I would be able to define an error
 *    on a `GET` and a valid response on `PUT`, which would solve the issue.
 * 3. Github's API is weird about file uploads.  You do a `PUT` request
 *    regardless of whether your file is a new one or an existing one.  A more
 *    proper REST/CRUD structure would be to `POST` new files and `PUT` existing
 *    ones, as is defined by the usual usage of those HTTP verbs
 *
 * Due to these errors, and the fact that I don't want to go and write the
 * improved new/existing file detection, I'm just doing to leave this as a
 * skipped test.  If I were to test it, I would have the `GET` endpoint error
 * but the `PUT` endpoint return a valid response, which would allow us to
 * simulate uploading a new file.
 */
skip('it uploads a new file correctly', function(assert) {
  assert.expect(1);

  defineFixture('https://api.github.com/repos/alexlafroscia/giteasy/contents/octokit.rb', {
    response: FileFixtures[0],
    textStatus: 'success'
  });

  var component = this.subject({
    repo: RepoFixtures[0],
    path: '/'
  });

  this.render();

  // Test uploading the file
  component.uploadFile(FileFixtures[0], FileFixtures[0].name)
  .then(function(data) {
    assert.equal(data.name, 'octokit.rb', 'Resolve a valid file');
  });
});

test('it handles the uploadFiles action properly', function(assert) {
  assert.expect(1);

  const files = [{name: 'octokit.js'}];

  var component = this.subject({
    repo: RepoFixtures[0],
    path: '/',
    uploadFile: function() {
      assert.ok(true, 'File uploader was invoked');
    }
  });

  component.set('newFiles', files);
  component.send('uploadFiles');
});
