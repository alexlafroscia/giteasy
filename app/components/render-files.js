import Ember from 'ember';
import FileUpload from '../mixins/file-upload';

export default Ember.Component.extend(FileUpload, Ember.PromiseProxyMixin, {

  isLoading: true,
  files: null,

  getFiles: function() {
    var repo = this.get('repo');
    var path = this.get('path');
    if (path.slice(-1) === '/') {
      path = path.substring(0, path.length - 1);
    }
    new Ember.RSVP.Promise(function(resolve, reject) {
      repo.contents('master', path, function(err, contents) {
        if (!Ember.isBlank(err)) {
          reject(err);
        } else {
          resolve(contents);
        }
      });
    }).then(function(contents) {
      // Add the `isFolder` property to each object and resolve
      // the resulting array
      return new Ember.RSVP.resolve(contents.map(function(item) {
        if (item.type === 'dir') {
          item.isFolder = true;
          item.isFile = false;
        } else {
          item.isFolder = false;
          item.isFile = true;
        }
        return item;
      }));
    }).then(function(contents) {
      return new Ember.RSVP.resolve(contents.sortBy('isFile', 'name'));
    }).then((contents) => {
      this.set('files', contents);
      this.set('isLoading', false);
    }).catch((error) => {
      this.set('error', error);
      this.set('isRejected', true);
      this.set('isLoading', false);
    });
  }.on('init').observes('path'),


  // Actions
  actions: {

    downloadFile: function(fileName) {
      var repo = this.get('repo');
      var path = this.get('path');
      repo.read('master', path + fileName, function(err, data) {
        if (!Ember.isBlank(err)) {
          console.error(err);
        } else {
          window.open('data:text;charset=utf-8,' + data);
        }
      });
    },


    /**
     * Upload files to the repo
     */
    uploadFiles: function() {
      var repo = this.get('repo');
      var files = this.get('newFiles');

      // Get path to file
      var path = this.get('path');
      if (path.slice(-1) === '/') {
        path = '';
      }
      path += files.objectAt(0).name;

      var commit = "Upload file " + files.objectAt(0).name;
      var reader = new FileReader();

      reader.onload = () => {
        console.log('uploading the file');
        var file = reader.result;

        repo.write('master', path, file, commit, (err) => {
          if (err) {
            console.error(err);
          } else {
            this.get('newFiles').removeAt(0);
          }
        });
      };

      reader.onerror = function() {
        reader.abort();
      };

      reader.readAsText(files.objectAt(0));
    }

  }

});
