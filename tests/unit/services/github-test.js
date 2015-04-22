import { moduleFor, test } from 'ember-qunit';

// Fixtures
import { defineFixture } from 'ic-ajax';

moduleFor('service:github', 'Service: github', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

test('it gets initialized with an access token if one exists in localStorage', function(assert) {
  assert.expect(1);
  localStorage.setItem('accessToken', 'my-test-token');
  var service = this.subject();
  assert.equal('my-test-token', service.get('accessToken'), 'Initialized with access token');
});

/**
 * Test the AJAX request maker with the default options
 *
 * I would like to eventually verify that the options were the expected
 * defaults, and that overriding them works correctly, but at the moment
 * `ic-ajax` does not support this.  A pull request is filed here that would add
 * the ability to define a callback to run when the request is received by the
 * fixture, but it hasn't been accepted as of the time of writing.
 *
 * https://github.com/instructure/ic-ajax/pull/30
 *
 * The addition of this callback would also allow for the testing of the
 * correctly defined Authorization headers, which I would like to do, but it's
 * not worth moving to a whole new server mocking system just to add this
 * ability.
 */
test('it makes a valid request with default options', function(assert) {
  assert.expect(1);
  var service = this.subject({
    accessToken: 'my-test-token'
  });

  defineFixture('https://api.github.com/test', {
    response: 'valid'
  });

  service.request('test').then(function(data) {
    assert.equal(data, 'valid', 'Method hit the correct endpoint');
  });
});
