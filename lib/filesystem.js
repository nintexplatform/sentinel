const path = require('path');
const fs = require('fs');
const { promisify, promisifyObject } = require('./promisify');

class Files {
  constructor() {
    // Create async version of the fs module
    Object.assign(this, promisifyObject(fs, ['readdir', 'stat', 'readFile', 'appendFile', 'writeFile']));
    // exists callback does not have an error as first arg.
    this.exists = filePath => promisify(cb => fs.exists(filePath, cb)).catch(result => result);
  }

  async statDirectory(directory, options) {
    const nameFilter = options && typeof options.nameFilter === 'function' ? options.nameFilter : () => true;
    const pathFilter = options && typeof options.pathFilter === 'function' ? options.pathFilter : () => true;
    const data = await this.readdir(directory);
    const filtered = data
      .filter(nameFilter)
      .map(sd => path.join(directory, sd))
      .filter(pathFilter);
    return Promise.all(filtered.map(sd => this.stat(sd).then(stat => ({
      path: sd,
      stat,
    }))));
  }

  async statDirectoryRecursive(directory, options) {
    const stats = await this.statDirectory(directory, options);
    const dirs = stats.filter(s => s.stat.isDirectory()).map(s => s.path);
    const substats = await Promise.all(dirs.reduce((agg, dir) =>
      agg.concat(this.statDirectoryRecursive(dir, options)), []));
    return Files.flatten(stats.concat(substats));
  }

  async getDirectories(directory, options) {
    const stats = await this.statDirectory(directory, options);
    return stats
      .filter(s => s.stat.isDirectory())
      .map(s => s.path);
  }

  async getFiles(directory, options) {
    const stats = await this.statDirectory(directory, options);
    return stats
      .filter(s => s.stat.isFile())
      .map(s => s.path);
  }

  async getDirectoriesRecursive(directory, options) {
    const dirs = await this.getDirectories(directory, options);
    const subdirs = await Promise.all(dirs.reduce((agg, dir) =>
      agg.concat(this.getDirectoriesRecursive(dir, options)), []));
    return Files.flatten(dirs.concat(subdirs));
  }

  async getFilesRecursive(directory, options) {
    const stats = await this.statDirectoryRecursive(directory, options);
    return stats.filter(s => s.stat.isFile()).map(s => s.path);
  }

  async copyFile(src, dest) {
    let target = dest;
    try {
      // if dest is an existing dir, copy into it with same filename
      const destStat = await this.stat(dest);
      target = destStat.isDirectory() ? path.join(dest, path.basename(src)) : dest;
    } catch (e) {
      // if dest doesnt exist. Ignore and attempt copy
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    return new Promise((resolve, reject) => {
      let called = false;
      const rejectOnce = (e) => {
        if (!called) {
          called = true;
          reject(e);
        }
      };
      const rd = fs.createReadStream(src);
      rd.on('error', rejectOnce);
      const wr = fs.createWriteStream(target);
      wr.on('error', rejectOnce);
      wr.on('close', resolve);
      rd.pipe(wr);
    });
  }

  static flatten(lists) {
    return lists.reduce((a, b) => a.concat(b), []);
  }
}

module.exports = Files;
