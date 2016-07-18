"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatten = flatten;
exports.throwInvariant = throwInvariant;
exports.mapValues = mapValues;
var concat = Array.prototype.concat;

/**
 * Flattens an array one level
 */
function flatten(array) {
  return concat.apply([], array);
}

/**
 * Throws with message if condition is false.
 * @param {Boolean} condition The condition to assert.
 * @param {String} message The message of the error to throw.
 */
function throwInvariant(condition, message) {
  if (!condition) {
    throw Error(message);
  }
}

/**
 * Maps over each value in an object and creates a new object with the mapped
 * values assigned to each key.
 * @param {Object} object The source object.
 * @param {Function} mapper The mapper function that receives the value and the key.
 * @returns {Object} A new object that contains the mapped values for the keys.
 */
function mapValues(object, mapper) {
  return Object.keys(object).reduce(function (current, key) {
    current[key] = mapper(object[key], key);
    return current;
  }, {});
}