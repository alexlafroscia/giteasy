import Ember from 'ember';
import FileUploadMixin from '../../../mixins/file-upload';
import { module, test } from 'qunit';

module('FileUploadMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var FileUploadObject = Ember.Object.extend(FileUploadMixin);
  var subject = FileUploadObject.create();
  assert.ok(subject);
});
