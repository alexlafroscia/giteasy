import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:repo/files', 'RepoFilesController', {
  // Specify the other units that are required for this test.
  needs: ['controller:repo']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
