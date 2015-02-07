import Ember from 'ember';
import FileField from 'ember-uploader/file-field';

export default FileField.extend(
{
	filesDidChange: (function()
	{
		var files = this.get('files');

		if (!Ember.isEmpty(files))
		{
			var reader = new FileReader();

			repo.write('master', 'path/to/file', files[0].getAsBinary(), 'YOUR_COMMIT_MESSAGE', function(err) {});

			/*
			reader.onload = function(e)
			{
				var text = reader.result;
				alert(text);
				//repo.write('master', 'path/to/file', 'YOUR_NEW_CONTENTS', 'YOUR_COMMIT_MESSAGE', function(err) {});
			};

			reader.getAsBinary(files[0]);
			*/
		}


	}).observes('files')
});
