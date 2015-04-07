import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:repo/index', 'Controller: repo/index', {
  // Specify the other units that are required for this test.
  needs: ['service:github']
});

test('it gets the repo property from the session service', function(assert) {
  assert.expect(1);
  var controller = this.subject();
  const repo = {name: 'giteasy'};
  controller.set('session.currentRepo', repo);
  assert.equal(controller.get('repo'), repo, 'Repo alias is correct');
});
