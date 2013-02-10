/**
 * @name flickr-backup.lib
 * @version 0.0.2
 * @author Seb Flippence
 * @description Recursively backs up photos to Flickr (with history/state to prevent the same photos from being uploaded again)
 */
(function () {
    /**
     * flickr-backup config
     *
     * @type {Object}
     * @private
     */
    var _config = {
        // Regex of supported file types
        'supportedFiletypes':'^.*\.(jpg|JPG|jpeg|JPEG|png|PNG)$',
        'historyFile':'history'
    };

    /**
     * Returns an object of files from a given path recursively, that match a given regex
     *
     * @param {String} path - system path
     * @param {String} type - limit to given regex
     * @return {Object}
     * @private
     */
    function _listFilesFromDir(path, type) {
        var files = {},
            i = 0;

        var DirReader = require('dirreader');

        DirReader.readDirSync(path, function (err, fullPath, stats, ifDir) {
            if (err) {
                throw err;
            }

            // Only add if its a file & matches given filetype
            if (!ifDir && fullPath.match(type)) {
                // Convert to a relative path
                var relativePath = (function () {
                    var posOfRelativePath = fullPath.search(path);
                    var relativePath = fullPath.substring(posOfRelativePath + 1, fullPath.length);
                    // Remove any slashes at the start
                    if (relativePath.charAt(0) === '/') {
                        relativePath = relativePath.substring(1);
                    }
                    return relativePath;
                })();

                files[i] = {
                    'path':relativePath
                };
                i++;
            }
        });

        return files;
    }

    /**
     * Takes an input file path and converts to path to tags (removing the initial directory)
     *
     * @param {String} dirPath
     * @param {String} filePath
     * @return {Array}
     * @private
     */
    function _convertPathToTags(dirPath, filePath) {
        dirPath = dirPath.replace(/^\./, '');
        dirPath = dirPath.replace(/^\//, '');
        filePath = filePath.replace(dirPath, '');

        var fileParts = filePath.split('/'),
            tags = [],
            i = 1;
        for (var part in fileParts) {
            var filePart = fileParts[part];
            if (filePart !== '' && fileParts.length !== i) {
                tags.push(filePart.replace(/ /g, '_').replace(/"/g, ''));
            }

            i++;
        }

        return tags;
    }

    /**
     * Returns list of files and path as tags
     *
     * @param {String} path
     * @return {Array}
     */
    function getAssetList(path) {
        path = path || '.';

        var fileList = _listFilesFromDir(path, _config.supportedFiletypes),
            i = 0;
        for (file in fileList) {
            fileList[i]['tags'] = _convertPathToTags(path, fileList[file].path);
            // Escape special chars 
            fileList[i]['path'] = fileList[i]['path'].replace(/(["\s'&$`\\\(\)])/g, '\\$1');
            i++;
        }

        return fileList;
    }

    /**
     * Executes a system command (synchronous)
     *
     * @param {String} cmd
     */
    function execSync(cmd) {
        var execSync = require('exec-sync');
        var result = execSync(cmd, true);
        return result;
    }

    /**
     * Holds the history
     *
     * @type {null} || {Object}
     * @private
     */
    var _history = null;

    /**
     * Loads the history in our private _history
     *
     * @private
     */
    function _loadHistory() {
        var fs = require('fs');
        _history = (fs.existsSync(_config.historyFile + '.json')) ? require('./../' + _config.historyFile) : {};
    }

    /**
     * Will attempt to save a file
     *
     * @param filename
     * @param data
     * @private
     */
    function _saveFile(filename, data) {
        var fs = require('fs');
        fs.writeFileSync(filename, data);
    }

    /**
     * Will append a history file with the given key and value
     *
     * @param {String} key
     * @param {String} value
     */
    function appendHistory(key, value) {
        if (typeof value !== 'string' || value === '') {
            // Cannot save without a value
            return;
        }

        if (_history === null) {
            _loadHistory();
        }

        _history[key] = value.replace("\n", "");

        _saveFile(_config.historyFile + '.json', JSON.stringify(_history));
    }

    /**
     * Checks if a given key is stored in the current history
     *
     * @param {String} key
     * @return {Boolean}
     */
    function inHistory(key) {
        if (_history === null) {
            _loadHistory();
        }

        return _history.hasOwnProperty(key);
    }

    /**
     * Works out what the ID of the uploaded asset is from the flickr_upload commands stdout
     *
     * @param {String} stdout
     * @return {String}
     */
    function getIdFromFlickrUploadResponse(stdout) {
        var stdoutParts = stdout.split('http://www.flickr.com/tools/uploader_edit.gne?ids=');
        return (typeof stdoutParts[1] !== 'undefined') ? stdoutParts[1] : null;
    }

    /**
     * Public methods
     *
     * @type {Object}
     */
    module.exports = {
        'getAssetList':getAssetList,
        'execSync':execSync,
        'appendHistory':appendHistory,
        'inHistory':inHistory,
        'getIdFromFlickrUploadResponse':getIdFromFlickrUploadResponse
    };
})();