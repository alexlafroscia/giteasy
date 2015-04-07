import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:choose', 'Controller: choose', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('if the filter is blank, the original content is returned', function(assert) {
  assert.expect(3);

  const repos = [{name: 'Giteasy', description: 'This is GitEasy'}];

  var controller = this.subject({
    content: repos,
    filter: ''
  });

  assert.equal(controller.get('content').length, 1, 'Content has one item in it');
  assert.equal(controller.get('arrangedContent').length, 1, 'Filtered content has one item in it');
  assert.deepEqual(controller.get('content'), controller.get('arrangedContent'), 'Content and filtered content are the same array');
});

test('if the filter is not blank, then only matching results are in the filtered array', function(assert) {
  assert.expect(6);

  const repos = [{name: 'Giteasy', description: 'This is GitEasy'}];

  var controller = this.subject({
    content: repos,
    filter: 'Giteasy'
  });

  // Test exact match of name
  assert.equal(controller.get('arrangedContent').length, 1, 'Same name: filtered content has correct length');

  // Test case mismatch of name
  controller.set('filter', 'GITEASY');
  assert.equal(controller.get('arrangedContent').length, 1, 'Case mismatch name: filtered content has correct length');

  // Test mismatch of name
  controller.set('filter', 'octokit');
  assert.equal(controller.get('arrangedContent').length, 0, 'Mismatch name: filtered content has correct length');

  // Test exact match description
  controller.set('filter', 'This is');
  assert.equal(controller.get('arrangedContent').length, 1, 'Same case, partial match description: filtered content has correct length');

  // Test case mismatch description
  controller.set('filter', 'this is');
  assert.equal(controller.get('arrangedContent').length, 1, 'Mismatch case, partial match description: filtered content has correct length');

  // Test mismatch of description
  controller.set('filter', 'this is octokit');
  assert.equal(controller.get('arrangedContent').length, 0, 'Mismatch case, mismatch description: filtered content has correct length');
});
