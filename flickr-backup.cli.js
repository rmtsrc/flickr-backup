/**
 * @name flickr-backup.cli
 * @version 0.0.1
 * @version Seb Flippence <seb@flippence.co.uk>
 * @description Recursively backs up photos to Flickr (with history/state to prevent the same photos from being uploaded again)
 */
(function () {
	var flickrBackup = require('./lib/flickr-backup');

	// Read in user input from cli
	var relativeFolderToUpload = process.argv[2];

	if (relativeFolderToUpload == undefined) {
		console.error('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' ./relativeFolderToUpload');
		process.exit(1);
	}
	
	flickrBackup.uploadFolder(relativeFolderToUpload);
})();