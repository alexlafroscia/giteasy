import Ember from 'ember';

export default Ember.Component.extend(Ember.PromiseProxyMixin, {

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
      console.error(error);
      this.set('error', error);
      this.set('isRejected', true);
      this.set('isLoading', false);
    });
  }.on('init').observes('path')

});
