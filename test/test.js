(function(){
    var FlickrBackup = require('../flickr-backup.lib');

    // Config testing
    var config = FlickrBackup.loadConfig('./config');

    var option1 = config.get('add_folders_as_tags');
    console.assert(option1 === true, 'Config should be able to get add_folders_as_tags config value');

    var option2 = config.get('default_upload_privacy');
    console.assert(option2.is_public === 0, 'Config should be able to get default_upload_privacy.is_public config value');

    // Folder scanning tests
    var folderStructure = FlickrBackup.getAssetList('./fixtures/sample_folder');
    console.assert(folderStructure[0].path === 'fixtures/sample_folder/foo/bar/baz.jpg', 'Folder structure should contain sample file');
    console.assert(folderStructure[0].tags[0] === 'foo', 'File tag should contain sample tags');
    console.assert(folderStructure[0].tags[1] === 'bar', 'File tag should contain sample tags');

    // Running a system command
    var systemCommandCallback = function(error, stdout, stderr) {
        console.assert(stdout.indexOf('Hello World') !== -1, 'System should have responded with the correct message');
    };
    var systemCommand = FlickrBackup.exec('echo "Hello World"', systemCommandCallback);

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