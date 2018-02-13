import * as querystring from 'querystring';
import * as url from 'url';

export class Utils {
  static extractVideoIdFromYoutubeUrl(ytUrl: string): string {
    const u = url.parse(ytUrl);
    return <string>querystring.parse(u.query)['v'] || u.pathname.slice(1, 11);
  }

  /**
   * @param {string} string
   * @param {Object} params
   * @returns {string} Interpolation of the redirect path with the parameters.
   */
  static interpolate(string, params = {}) {
    params = {...params};
    const result = [];
    let segmentMatch,
      key;

    (string || '').split(':').forEach((segment, i) => {
      if (i === 0 || !(/^[a-z]/i.test(segment))) {
        result.push(i === 0 ? segment : ':' + segment);
      } else {
        segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
        key = segmentMatch[1];
        result.push(params[key]);
        result.push(segmentMatch[2] || '');
        delete params[key];
      }
    });

    return result.join('');
  }

  /**
   * Check if provided value is array.
   * @param {any} value
   * @returns {boolean}
   */
  static isArray(value: any): boolean {
    if (value === Array) {
      return true;
    } else if (typeof Array.isArray === 'function') {
      return Array.isArray(value);
    } else {
      return value instanceof Array;
    }
  }

  /**
   * Check if object is empty.
   * @param obj
   * @returns {boolean}
   */
  static isEmptyObj(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
  }

  static isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  /**
   * Check if provided value is primitive type.
   * @param {any} value
   * @returns {boolean}
   */
  static isPrimitive(value: any): boolean {
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        return true;
    }
    return (value instanceof String || value === String ||
      value instanceof Number || value === Number ||
      value instanceof Boolean || value === Boolean);
  }

  static readableFileSize(size): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (size >= 1024) {
      size /= 1024;
      ++i;
    }
    return size.toFixed(1) + ' ' + units[i];
  }

  /**
   * Generate uuid.
   * @returns {string}
   */
  static uuid(): string {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
