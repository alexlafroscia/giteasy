import Ember from 'ember';
import config from '../config/environment';

export default function fileReader(file) {
  var reader = new FileReader();
  // Testing-specific behavior
  if (config.environment === 'test') {
    return Ember.RSVP.resolve(file);
  }

  // If we're not in testing, actually read the file
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
