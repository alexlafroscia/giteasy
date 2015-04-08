import Ember from 'ember';
import { initialize } from '../../../initializers/monkeypatches';
import { module, test } from 'qunit';

var container, application;

module('Initializer: monkeypatches', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      container = application.__container__;
      application.deferReadiness();
    });
  }
});


/**
 * String.prototype.contains
 *
 * Return true/false based on whether or not a given string contains some
 * substring.
 */
test('it properly patches the String primitive to add the `contains` method', function(assert) {
  assert.expect(2);
  initialize(container, application);

  assert.ok('giteasy'.contains('git'), 'Properly detects valid substring');
  assert.ok(!'giteasy'.contains('ocktokit'), 'Properly detects invalid substring');
});
