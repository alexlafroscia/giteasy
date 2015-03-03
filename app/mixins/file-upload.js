import Ember from 'ember';

export default Ember.Mixin.create({

  classNames: ['file-upload'],
  classNameBindings: ['has-files:hasFiles'],


  /**
   * Initialize the properties for the mixin.
   * This is done through the constructor so that all views including the mixin
   * do not share the same array of files.
   */
  init: function() {
    this._super();
    this.set('fileIsHovering', false);
    this.set('enteredElement', null);
    this.set('newFiles', Ember.ArrayProxy.create({
      content: []
    }));
  },


  /**
   * Handle file on drag enter.
   */
  dragEnter: function(event) {
    event.preventDefault();
    this.set('enteredElement', event.target);
    if (!this.get('fileIsHovering')) {
      this.set('fileIsHovering', true);
    }
  },


  /**
   * Prevents a dragged file from overwriting the current page.
   */
  dragOver: function(event) {
    event.preventDefault();
  },


  /**
   * Handle the file leaving the drag
   */
  dragLeave: function(event) {
    event.preventDefault();
    if (this.get('enteredElement') === event.target) {
      // Clean up UI
      this.set('fileIsHovering', false);
      this.set('enteredElement', null);
    }
  },


  /**
   * Handle adding a file on drop
   */
  drop: function(event) {
    event.preventDefault();
    if (this.get('enteredElement') === event.target) {
      var files = event.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        var item = files.item(i);
        this.get('newFiles').pushObject(item);
      }
    }
  }

});
