(function(){
    var FlickrBackup = require('./flickr-backup.lib');

	var debug = false;
	var folderToBackup = './pictures';

    // List files in folder
    var assetList = FlickrBackup.getAssetList(folderToBackup);	

    // Iterate through file list via recursion
    var uploadAssetList = function(currentList, listItterator, errorCount) {
    	var asset = currentList[listItterator];
    	errorCount = errorCount || 0;

    	if (typeof asset === 'undefined') {
    		// Then we are done
    		return;
    	}

    	if (!FlickrBackup.inHistory(asset.path)) {
    		var cmd = '/opt/local/bin/flickr_upload --tag="' + asset.tags.join(' ') + '" ' + asset.path;

		    if (!debug) {
				// Upload
		    	var systemCommand = FlickrBackup.exec(cmd, (function(currentAsset, newList, newListItterator, currentCmd, currentErrorCount){
		            return function(error, stdout, stderr) {
		            	if (error) {
		            		console.log('There was an error uploading the asset: ' + error + ' ' + stderr + ' ' + stdout + ' ' + currentCmd);

					    	if (currentErrorCount >= 3) {
					    		// Ignore and continue
					    		newListItterator++;					    		
					    		console.log('Giving up on attempt: ' + currentErrorCount);
					    		uploadAssetList(newList, newListItterator);
					    		return;
					    	}

					    	currentErrorCount++;
					    	console.log('Retry attempt: ' + currentErrorCount);
						    uploadAssetList(newList, newListItterator, currentErrorCount);
						    return;
		            	}

						// Setup upload callback
						console.info('Uploaded "' + currentAsset.path + '" with the following tags: ', currentAsset.tags);						

					    // Save to history
					    var flickrId = FlickrBackup.getIdFromFlickrUploadResponse(stdout);
					    FlickrBackup.appendHistory(currentAsset.path, flickrId);

					    // Increment count and recurse
					    newListItterator++;
					    uploadAssetList(newList, newListItterator);
					};
		        })(asset, currentList, listItterator, cmd, errorCount));

		    } else {
		    	console.info('Debug on not uploading, command would have been: '+ cmd);
			    FlickrBackup.appendHistory(asset.path, '');
		    }
		} else {
			console.info('Skipping "' + asset.path + '" as it\'s in the history');
		    listItterator++;
		    uploadAssetList(currentList, listItterator);
		}    	
    }

	// Kick it off
    uploadAssetList(assetList, 0);
})();