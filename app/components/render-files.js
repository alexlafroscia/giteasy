import Ember from 'ember';
import FileUpload from '../mixins/file-upload';

export default Ember.Component.extend(FileUpload, Ember.PromiseProxyMixin, {

  github: Ember.inject.service(),

  isLoading: true,
  files: null,

  getFiles: function() {
    var repo = this.get('repo');
    var path = this.get('path');
    if (path.slice(-1) === '/') {
      path = path.substring(0, path.length - 1);
    }

    this.get('github').request(`repos/${repo.owner.login}/${repo.name}/contents/${path}`)
    .then(function(contents) {
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
      if (!this.get('isDestroyed')) {
        this.set('error', error);
        this.set('isRejected', true);
        this.set('isLoading', false);
      }
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
      var github = this.get('github');

      // Get path to file
      var path = this.get('path');
      if (path.slice(-1) === '/') {
        path = '';
      }

      // Create a promise for each file and resolve them all together
      Ember.RSVP.all(files.map(function(file) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          const name = file.name;
          const filePath = path + name;

          var reader = new FileReader();

          reader.onload = function() {
            var file = reader.result;
            const url = `repos/${repo.owner.login}/${repo.name}/contents/${filePath}`;

            github.request(url)
            .then(function(data) {
              // GET request was successful, file exists
              return Ember.RSVP.resolve({
                path: filePath,
                message: 'Updating file through GitEasy',
                content: btoa(file),
                sha: data.sha
              });
            })
            .catch(function() {
              // GET request failed, file is new
              return Ember.RSVP.resolve({
                path: filePath,
                message: 'Updating file through GitEasy',
                content: btoa(file),
              });
            })
            .then(function(data) {
              // Upload the file, using the data object resolved previously in
              // the promise chain
              return github.request(url, {
                type: 'PUT',
                data: JSON.stringify(data)
              });
            })
            .then(function(data) {
              resolve(data);
            });
          };

          // Return a rejecting promise if there's an error reading the file
          reader.onerror = function() {
            reader.abort();
            reject();
          };

          // Read the file
          reader.readAsText(file);
        });
      }))
      .then(function() {
        console.debug('They all loaded');
      });

    }

  }

});
