flickr-backup
=============

Recursively backs up photos to Flickr (with history/state to prevent the same photos from being uploaded again)

## Install

1. From your package manager install Node.js, npm and Flickr::Upload <http://www.flickr.com/services/apps/4795/> e.g. via MacPorts:
```
port install nodejs npm p5.12-flickr-upload
```
2. Generate a Flickr::Upload auth_token e.g.
```
flickr_upload --auth
```
3. Create a flickr_upload configuration file "~/.flickrrc" with the generated auth_token and optionally set default viewing permissions
4. Check that flickr_upload can upload images e.g.
```
flickr_upload testImage.jpg
```
5. Install flickr-backup:
```
npm install flickr-backup
```

## Usage

### From the command line

```
node flickr-backup.cli.js ./relativeFolderToUpload
```

### From Node.js

```js
var FlickrBackup = require('flickr-backup');

FlickrBackup.uploadFolder('./relativeFolderToUpload');
```

## TODO

* Use a Node.js Flickr uploader

## License

(The MIT License)

Copyright (c) 2012 Seb Flippence;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.