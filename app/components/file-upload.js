import Ember from 'ember';
import FileField from 'ember-uploader/file-field';

export default FileField.extend({
  repo: null,
  token: null,

  filesDidChange: function() {
    var repo = this.get('repo');
    var token = this.get('token');
    var files = this.get('files');
    var owner = this.get('owner');
    var repoName = this.get('repoName');

    // Get path to file
    var path = this.get('path');
    if (path.slice(-1) === '/') {
      path = '';
    }
    path += files[0].name;

    var commit = "Upload file " + files[0].name;
    var reader = new FileReader();

    reader.onload = () => {
      console.log('uploading the file');
      var file = reader.result;

      var url = 'https://api.github.com/repos/';
      url = url + owner + '/';
      url = url + repoName + '/';
      url = url + 'contents/';
      url = url + path;

      repo.write('master', path, file, commit, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.debug('it worked!');
          this.sendAction('uploadSuccess');
        }
      });

    };

    reader.onerror = function() {
      reader.abort();
    };

    reader.readAsText(files[0]);

  }.observes('files')

});
