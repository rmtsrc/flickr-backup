(function () {
    var _enableLog = true;

    var FlickrBackup = require('./flickr-backup.lib'),
        moment = require('moment');

    /**
     * Logs out progress if logging is enabled
     *
     * @param {String} msg
     */
    var _log = function(msg) {
        if (_enableLog) {
            var date = moment();
            var dateString = date.format("DD-MM-YYYY HH:mm:ss");

            console.log('[' + dateString + ']', msg);
        }
    };

    /**
     * Uploads an individual asset to Flickr
     *
     * @param {String} asset
     * @param {Int} errorCount - optional
     */
    var _uploadAsset = function (asset, errorCount) {
        errorCount = errorCount || 0;

        if (FlickrBackup.inHistory(asset.path)) {
            _log('Skipping "' + asset.path + '" as it\'s in the history');
            return;
        }

        var tags = asset.tags.join(' ');        
        var tagsCmd = (tags !== '') ? '--tag="' + tags + '" ' : '';

        var cmd = '/opt/local/bin/flickr_upload ' + tagsCmd + asset.path;

        _log('Uploading "' + asset.path + '" with the following tags: ' + tags);

        // Upload
        var systemCommand = FlickrBackup.execSync(cmd);
        if (systemCommand.stderr) {
            _log('There was an error uploading the asset: ' + systemCommand.stderr + ' ' + systemCommand.stdout + ' ' + cmd);
            if (errorCount >= 3) {
                // Ignore and continue
                _log('Giving up on attempt: ' + errorCount);
                return;
            }

            errorCount++;
            _log('Retry attempt: ' + errorCount);
            uploadAsset(asset, errorCount);
        }        

        // Save to history
        var flickrId = FlickrBackup.getIdFromFlickrUploadResponse(systemCommand.stdout);
        FlickrBackup.appendHistory(asset.path, flickrId);

        _log('Uploaded. Flickr ID: ' + flickrId);        
    };

    /**
     * Uploads a folder to Flick
     *
     * @param {String} folder - relative folder path
     * @param {Object} options
     * @example uploadFolder('./pictures', {'log':true});
     */
    var uploadFolder = function (folder, options) {
        options = options || {};
        _enableLog = options.hasOwnProperty('log') ? options.log : true;

        // List files in folder
        var assetList = FlickrBackup.getAssetList(folder);

        // Iterate through file list and upload each asset
        for (var i in assetList) {
            var asset = assetList[i];
            _uploadAsset(asset);
        }
    };

    /**
     * Public methods
     *
     * @type {Object}
     */
    module.exports = {
        'uploadFolder':uploadFolder
    };
})();