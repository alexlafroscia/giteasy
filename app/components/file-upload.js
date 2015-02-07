import Ember from 'ember';
import FileField from 'ember-uploader/file-field';
//import FileField from 'ember-uploader/dist/ember-uploader/file-field';
//import FileField from 'ember-uploader/file-field';


export default FileField.extend({
	filesDidChange: (function() {
		var files = this.get('files');

		if (!Ember.isEmpty(files)){
			console.log("Not empty");
			alert(files[0].name);
		}
	}).observes('files')
});
