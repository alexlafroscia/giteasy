import Ember from 'ember';
import FileField from 'ember-uploader/file-field';

export default FileField.extend({
	filesDidChange: (function() {
		var files = this.get('files');

		if (!Ember.isEmpty(files)){
			//alert("Ready to commit "files[0].name);
			var text = new FileReader(files[0]).readAsText();
			alert(text)
		}


	}).observes('files')
});
