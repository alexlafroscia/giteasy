import Ember from 'ember';
import FileUploadMixin from '../../../mixins/file-upload';
import { module, test } from 'qunit';

module('Mixin: File Upload');

// Replace this with your real tests.
test('it sets the correct properties on dragEnter', function(assert) {
  assert.expect(3);
  var FileUploadObject = Ember.Object.extend(FileUploadMixin);
  const target = 'I am the target';

  var subject = FileUploadObject.create();
  subject.dragEnter({
    target: target,
    preventDefault: function() {
      assert.ok(true, 'Default event behavior intercepted');
    }
  });
  assert.equal(subject.get('enteredElement'), target, 'Correctly set entered element');
  assert.equal(subject.get('fileIsHovering'), true, 'Correctly sets file hover status');
});

test('it prevents the degfault dragOver behavior', function(assert) {
  assert.expect(1);
  var FileUploadObject = Ember.Object.extend(FileUploadMixin);
  const target = 'I am the target';

  var subject = FileUploadObject.create();
  subject.dragOver({
    target: target,
    preventDefault: function() {
      assert.ok(true, 'Default event behavior intercepted');
    }
  });
});

test('it sets the correct properties on dragLeave', function(assert) {
  assert.expect(3);
  var FileUploadObject = Ember.Object.extend(FileUploadMixin);
  const target = 'I am the target';

  var subject = FileUploadObject.create({
    enteredElement: target
  });
  subject.dragLeave({
    target: target,
    preventDefault: function() {
      assert.ok(true, 'Default dragOver behavior intercepted');
    }
  });
  assert.equal(subject.get('enteredElement'), null, 'Correctly cleared entered element');
  assert.equal(subject.get('fileIsHovering'), false, 'Correctly sets file hover status');
});

test('it adds files from the drop event', function(assert) {
  assert.expect(2);
  var FileUploadObject = Ember.Object.extend(FileUploadMixin);
  const target = 'I am the target';

  // Mock files object
  const files = {
    _items: [
      {name: 'giteasy'},
      {name: 'octokit.rb'}
    ],
    item: function(i) {
      return this._items[i];
    },
    length: 2
  };

  var subject = FileUploadObject.create();
  subject.set('enteredElement', target);
  subject.drop({
    target: target,
    preventDefault: function() {
      assert.ok(true, 'Default dragOver behavior intercepted');
    },
    dataTransfer: {
      files: files
    }
  });
  assert.equal(subject.get('newFiles.content').length, 2, 'Has correct number of new files');
});
