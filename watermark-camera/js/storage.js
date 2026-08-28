const PREFIX = "watermark-camera";

/**
 *
 * @param {string} key
 */
function get(key) {
  return localStorage.getItem(`${PREFIX}:${key}`);
}

/**
 *
 * @param {string} key
 * @param {string} value
 */
function set(key, value) {
  localStorage.setItem(`${PREFIX}:${key}`, value);
}

const storage = { get, set };
export default storage;
