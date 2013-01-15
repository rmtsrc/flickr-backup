(function () {
    var _config = {
        'supportedFiletypes':'^.*\.(jpg|JPG|jpeg|JPEG|png|PNG)$'
    };

    /**
     * Loads the configuration file from disc
     *
     * @param file
     * @return {Object}
     */
    function loadConfig(file) {
        file = file || './config';

        var config = require(file);

        return {
            get:function (key) {
                return config[key];
            }
        }
    }

    /**
     * Returns an object of files from a given path recursively, that match a given regex
     *
     * @param path - system path
     * @param type - limit to given regex
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
     * @param dirPath
     * @param filePath
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
        for (part in fileParts) {
            var filePart = fileParts[part];
            if (filePart !== '' && fileParts.length !== i) {
                tags.push(filePart);
            }

            i++;
        }

        return tags;
    }

    /**
     * Returns list of files and path as tags
     *
     * @param path
     * @return {Array}
     */
    function getAssetList(path) {
        path = path || '.';

        var fileList = _listFilesFromDir(path, _config.supportedFiletypes),
            i = 0;
        for (file in fileList) {
            fileList[i]['tags'] = _convertPathToTags(path, fileList[file].path);
            i++;
        }

        return fileList;
    }

    /**
     * Executes a system command and runs the callback once complete
     *
     * @param cmd
     * @param callback - method to be call with the arguments: error, stdout, stderr
     */
    function exec(cmd, callback) {
        require('child_process').exec(cmd, callback);
    }

    /**
     * Holds the history
     *
     * @type {null} || {object}
     * @private
     */
    var _history = null;

    /**
     * Loads the history in our private _history
     *
     * @private
     */
    function _loadHistory() {
        var fs = require('fs'),
            historyFile = './history';
        _history = (fs.existsSync(historyFile)) ? require(historyFile) : {};
    }

    /**
     * Will attempt to save a file, throws an error if it's unable to save
     *
     * @param path
     * @param content
     * @private
     */
    function _saveFile(filename, data) {
        var fs = require('fs');
        fs.writeFileSync(filename, data);
    }

    /**
     * Will append a history file with the given key and value
     *
     * @param key
     * @param value
     */
    function appendHistory(key, value) {
        if (_history === null) {
            _loadHistory();
        }

        _history[key] = value;

        _saveFile('./history.json', JSON.stringify(_history));
    }

    function inHistory(key) {
        if (_history === null) {
            _loadHistory();
        }

        return _history.hasOwnProperty(key);
    }

    /**
     * Public methods
     *
     * @type {Object}
     */
    module.exports = {
        'loadConfig':loadConfig,
        'getAssetList':getAssetList,
        'exec':exec,
        'appendHistory':appendHistory,
        'inHistory':inHistory
    };
})();