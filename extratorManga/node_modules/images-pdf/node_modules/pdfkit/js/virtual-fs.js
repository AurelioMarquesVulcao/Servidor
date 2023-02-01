'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var VirtualFileSystem = function () {
  function VirtualFileSystem() {
    classCallCheck(this, VirtualFileSystem);

    this.fileData = {};
  }

  VirtualFileSystem.prototype.readFileSync = function readFileSync(fileName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var encoding = typeof options === 'string' ? options : options.encoding;
    var virtualFileName = normalizeFilename(fileName);

    var data = this.fileData[virtualFileName];
    if (data == null) {
      throw new Error('File \'' + virtualFileName + '\' not found in virtual file system');
    }

    if (encoding) {
      // return a string
      return typeof data === 'string' ? data : data.toString();
    }

    return new Buffer(data, typeof data === 'string' ? 'base64' : undefined);
  };

  VirtualFileSystem.prototype.writeFileSync = function writeFileSync(fileName, content) {
    this.fileData[normalizeFilename(fileName)] = content;
  };

  VirtualFileSystem.prototype.bindFileData = function bindFileData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.reset) {
      this.fileData = data;
    } else {
      Object.assign(this.fileData, data);
    }
  };

  return VirtualFileSystem;
}();

function normalizeFilename(fileName) {
  if (fileName.indexOf(__dirname) === 0) {
    fileName = fileName.substring(__dirname.length);
  }

  if (fileName.indexOf('/') === 0) {
    fileName = fileName.substring(1);
  }

  return fileName;
}

var virtualFs = new VirtualFileSystem();

module.exports = virtualFs;
