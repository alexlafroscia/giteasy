import FileField from 'ember-uploader/file-field';

export default FileField.extend({
  repo: null,
  token: null,

  filesDidChange: function() {
    var repo = this.get('repo');
    var files = this.get('files');

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
