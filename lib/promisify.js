class Promisify {
  static promisifyObject(obj, properties) {
    const props = properties || Object.keys(obj);
    return props.reduce((newObj, p) => {
      // eslint-disable-next-line no-param-reassign
      newObj[p] = typeof obj[p] === 'function' ? (...args) => Promisify.promisify(cb => obj[p](...args, cb)) : obj[p];
      return newObj;
    }, {});
  }
  static promisify(func) {
    return new Promise((r, e) => {
      func((err, data) => {
        if (err) e(err);
        r(data);
      });
    });
  }
}

module.exports = Promisify;
