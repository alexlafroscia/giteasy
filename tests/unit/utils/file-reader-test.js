import fileReader from '../../../utils/file-reader';
import { module, test } from 'qunit';

module('fileReader', 'Utility: file-reader');

test('it reads the contents of a file', function(assert) {
  assert.expect(1);
  const filedata = 'this is my file name';
  var blob;
  try {
    blob = new Blob([filedata], { type: 'text/html'});
  } catch(e) {
    // TypeError old chrome and FF
    window.BlobBuilder = window.BlobBuilder ||
                         window.WebKitBlobBuilder ||
                         window.MozBlobBuilder ||
                         window.MSBlobBuilder;
    if(e.name === 'TypeError' && window.BlobBuilder) {
      var bb = new BlobBuilder();
      bb.append([filedata.buffer]);
      blob = bb.getBlob('text/html');
    }
  }
  return fileReader(blob).then(function(data) {
    assert.equal(data, filedata, 'The resolved contents match the file contents');
  });
});
