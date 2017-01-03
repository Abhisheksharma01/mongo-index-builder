"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = throwWrappedError;
/**
 * Creates a new error object with a specified error message and a specific
 * innerError property.
 *
 * @param  {string} message - The message for the new error object
 * @param  {Error} innerError - The innerError for the new error object
 * @return {Error} - The created Error object
 */
function throwWrappedError(message, innerError) {

  var newError = new Error(message);
  newError.innerError = innerError;

  throw newError;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi90aHJvd1dyYXBwZWRFcnJvci5lczYiXSwibmFtZXMiOlsidGhyb3dXcmFwcGVkRXJyb3IiLCJtZXNzYWdlIiwiaW5uZXJFcnJvciIsIm5ld0Vycm9yIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7O2tCQVF3QkEsaUI7QUFSeEI7Ozs7Ozs7O0FBUWUsU0FBU0EsaUJBQVQsQ0FBMkJDLE9BQTNCLEVBQW9DQyxVQUFwQyxFQUFnRDs7QUFFN0QsTUFBTUMsV0FBVyxJQUFJQyxLQUFKLENBQVVILE9BQVYsQ0FBakI7QUFDQUUsV0FBU0QsVUFBVCxHQUFzQkEsVUFBdEI7O0FBRUEsUUFBTUMsUUFBTjtBQUNEIiwiZmlsZSI6InRocm93V3JhcHBlZEVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGVycm9yIG9iamVjdCB3aXRoIGEgc3BlY2lmaWVkIGVycm9yIG1lc3NhZ2UgYW5kIGEgc3BlY2lmaWNcbiAqIGlubmVyRXJyb3IgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgZm9yIHRoZSBuZXcgZXJyb3Igb2JqZWN0XG4gKiBAcGFyYW0gIHtFcnJvcn0gaW5uZXJFcnJvciAtIFRoZSBpbm5lckVycm9yIGZvciB0aGUgbmV3IGVycm9yIG9iamVjdFxuICogQHJldHVybiB7RXJyb3J9IC0gVGhlIGNyZWF0ZWQgRXJyb3Igb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRocm93V3JhcHBlZEVycm9yKG1lc3NhZ2UsIGlubmVyRXJyb3IpIHtcblxuICBjb25zdCBuZXdFcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgbmV3RXJyb3IuaW5uZXJFcnJvciA9IGlubmVyRXJyb3I7XG5cbiAgdGhyb3cgbmV3RXJyb3I7XG59XG4iXX0=
//# sourceMappingURL=throwWrappedError.js.map
