import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:repo/files', 'Controller: repo/files', {
  // Specify the other units that are required for this test.
  needs: ['controller:repo']
});

test('it properly aliases properties from the repo controller', function(assert) {
  const repo = {name: 'giteasy'};
  const path = '/';

  var controller = this.subject({
    content: path
  });
  controller.set('controllers.repo.content', repo);

  assert.deepEqual(controller.get('repo'), repo, 'repo alias is correct');
  assert.deepEqual(controller.get('path'), path, 'path alias is correct');
});
