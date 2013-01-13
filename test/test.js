(function(){
    var FlickrBackup = require('../flickr-backup');

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

    console.info('Pass');
})();