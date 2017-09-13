const path = require('path');
const fs = require('fs');

class Files {
  static getDirectories(directory, filter) {
    const customFilter = typeof filter === 'function' ? filter : () => true;
    return fs.readdirSync(directory)
      .filter(subDirectory => fs.statSync(path.join(directory, subDirectory)).isDirectory())
      .filter(subDirectory => subDirectory[0] !== '.')
      .filter(customFilter)
      .map(subDirectory => path.join(directory, subDirectory));
  }

  static getDirectoriesRecursive(srcpath, filter) {
    return [
      srcpath,
      ...Files.flatten(Files
        .getDirectories(srcpath, filter)
        .map(d => Files.getDirectoriesRecursive(d, filter))),
    ];
  }

  static flatten(lists) {
    return lists.reduce((a, b) => a.concat(b), []);
  }
}

module.exports = Files;
