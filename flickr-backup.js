(function () {
    var debug = false;
    var folderToBackup = './pictures';

    var FlickrBackup = require('./flickr-backup.lib');

    var uploadAsset = function (asset, errorCount) {
        errorCount = errorCount || 0;

        if (FlickrBackup.inHistory(asset.path)) {
            console.info('Skipping "' + asset.path + '" as it\'s in the history');
            return;
        }

        var cmd = '/opt/local/bin/flickr_upload --tag="' + asset.tags.join(' ') + '" ' + asset.path;

        console.info('Uploading "' + asset.path + '" with the following tags: ', asset.tags);

        if (debug) {
            console.info('Debug on not uploading, command would have been: ' + cmd);
            return;
        }

        // Upload
        var systemCommand = FlickrBackup.execSync(cmd);
        if (systemCommand.stderr) {
            console.log('There was an error uploading the asset: ' + systemCommand.stderr + ' ' + systemCommand.stdout + ' ' + cmd);
            if (errorCount >= 3) {
                // Ignore and continue
                console.log('Giving up on attempt: ' + errorCount);
                return;
            }

            errorCount++;
            console.log('Retry attempt: ' + errorCount);
            uploadAsset(asset, errorCount);
        }        

        // Save to history
        var flickrId = FlickrBackup.getIdFromFlickrUploadResponse(systemCommand.stdout);
        FlickrBackup.appendHistory(asset.path, flickrId);

		console.info('Uploaded "' + asset.path + '" with the Flickr ID: ' + flickrId);        
	};

    // List files in folder
    var assetList = FlickrBackup.getAssetList(folderToBackup);

    // Iterate through file list and upload each asset
    for (var i in assetList) {
        var asset = assetList[i];
        uploadAsset(asset);
    }	
})();