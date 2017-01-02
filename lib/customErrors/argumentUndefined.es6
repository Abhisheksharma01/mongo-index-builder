/**
 * @module argumentUndefined
 */

/**
 * Error object. Thrown when a argument of a method is undefined or null.
 *
 * @class argumentUndefined
 * @param {string} argumentName - This is the name of the parameter that has
 * failed an undefined or null check.
 */
export default class argumentUndefined extends Error {
  constructor(argumentName) {
    super(`Argument ${argumentName} expected to be defined.`);
    this.errorName = argumentUndefined.name;
    this[argumentName] = argumentName;
  }
}
