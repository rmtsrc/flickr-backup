/**
 * @name flickr-backup.lib.test
 * @version 0.0.2
 * @version Seb Flippence
 * @description Recursively backs up photos to Flickr (with history/state to prevent the same photos from being uploaded again)
 */
(function(){
    var FlickrBackup = require('../lib/flickr-backup.lib');

    // Folder scanning tests
    var folderStructure = FlickrBackup.getAssetList('./fixtures/sample_folder');
    console.assert(folderStructure[0].path === 'fixtures/sample_folder/foo/bar/baz.jpg', 'Folder structure should contain sample file');
    console.assert(folderStructure[0].tags[0] === 'foo', 'File tag should contain sample tags');
    console.assert(folderStructure[0].tags[1] === 'bar', 'File tag should contain sample tags');

    // Running a system command
    var systemCommand = FlickrBackup.execSync('echo "Hello World"');
    console.assert(systemCommand.stdout.indexOf('Hello World') !== -1, 'System should have responded with the correct message');

    // Save and load history state
    FlickrBackup.appendHistory('filepath-foo1', 'id-bar1');
    FlickrBackup.appendHistory('filepath-foo2', "id-bar2\n");
    console.assert(FlickrBackup.inHistory('filepath-foo1') === true, 'Should have saved a key, value in history file');
    console.assert(FlickrBackup.inHistory('filepath-foo2') === true, 'Should have saved a key, value in history file');
    var assetList = [
        'foo',
        'bar',
        'test/fixtures/sample_folder/foo/bar/baz.jpg',
        'test/fixtures/sample_folder/foo/bar/bob.jpg'
    ];
    var previous = '';
    for (var i in assetList) {
        var asset = assetList[i];
        FlickrBackup.appendHistory(asset, 'foo' + i);
        if (previous !== '') {
            console.assert(FlickrBackup.inHistory(previous) === true, 'Should have saved a key, value in history file');
        }
        previous = asset;
    }
    // Remove test history file
    var fs = require('fs');
    fs.unlinkSync('./history.json');

    // Get ID from flickr_upload command
    var exampleStdout = "Uploading baz.jpg...\n" +
                        "Waiting for upload results (ctrl-C if you don't care)...\n" +
                        "baz.jpg is at http://www.flickr.com/tools/uploader_edit.gne?ids=8387118033";
    console.assert(FlickrBackup.getIdFromFlickrUploadResponse(exampleStdout) === '8387118033', 'Should have got the correct ID from the exampleStdout');
})();