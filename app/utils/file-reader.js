import Ember from 'ember';

export default function fileReader(file) {
  if (window.testFileReader) { return Ember.RSVP.resolve(file); }

  var reader = new FileReader();
  return new Ember.RSVP.Promise(function(resolve, reject) {
    // If the read is successful, resolve with the result
    reader.onload = function() {
      resolve(reader.result);
    };

    reader.onerror = function() {
      reader.abort();
      reject();
    };

    reader.readAsText(file);
  });
}
