import fileReader from '../../../utils/file-reader';
import { module, test } from 'qunit';

module('fileReader', 'Utility: file-reader');

test('it reads the contents of a file', function(assert) {
  assert.expect(1);
  const filedata = 'this is my file name';
  const blob = new Blob([filedata], { type: 'text/html'});
  return fileReader(blob).then(function(data) {
    assert.equal(data, filedata, 'The resolved contents match the file contents');
  });
});
